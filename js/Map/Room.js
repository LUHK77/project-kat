// js/Map/Room.js
import { ctx, blocoTamanho, ALTURA, LARGURA, registrarAreaEspecial } from "../map.js";
import { player } from "../Models/Player.js";
import { novaSeed, hash2D } from "../utils/hash.js";
import { gerarAreas } from "../utils/gerarAreas.js";

export class Room {

    constructor(tileX, tileY, opcoes = {}) {
    
        const sala = opcoes.sala ?? gerarAreas();

        this.tilesX = sala.largura;
        this.tilesY = sala.altura;
        this.tiles = sala.tiles;

        this.x = tileX * blocoTamanho;
        this.y = tileY * blocoTamanho;

        this.width = this.tilesX * blocoTamanho;
        this.height = this.tilesY * blocoTamanho;

        this.seed = novaSeed();

        registrarAreaEspecial(tileX, tileY, this.tilesX, this.tilesY, this);
    }

    // cada sala filha precisa implementar isso, retornando sua própria Image
    getFloorImage() {
        throw new Error("getFloorImage() precisa ser implementado pela classe filha");
    }

    tileAberto(col, row) {
        if (row < 0 || row >= this.tilesY) return false;
        if (col < 0 || col >= this.tilesX) return false;
        return !!this.tiles[row][col];
    }

    ehCanto(exposto) {
        const vertical = exposto.includes("up") || exposto.includes("down");
        const horizontal = exposto.includes("left") || exposto.includes("right");
        return vertical && horizontal;
    }

    drawFrame(frame, anguloGraus, screenX, screenY) {

        const cx = screenX + blocoTamanho / 2;
        const cy = screenY + blocoTamanho / 2;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(anguloGraus * Math.PI / 180);

        ctx.drawImage(
            this.getFloorImage(),
            0, frame * 32, 32, 32,
            -blocoTamanho / 2, -blocoTamanho / 2,
            blocoTamanho, blocoTamanho
        );

        ctx.restore();
    }

    drawTile(col, row, screenX, screenY) {

        const up    = this.tileAberto(col, row - 1);
        const down  = this.tileAberto(col, row + 1);
        const left  = this.tileAberto(col - 1, row);
        const right = this.tileAberto(col + 1, row);

        const exposto = [];
        if (!up) exposto.push("up");
        if (!down) exposto.push("down");
        if (!left) exposto.push("left");
        if (!right) exposto.push("right");

        if (exposto.length === 0) {
            const frame = hash2D(col, row, this.seed) % 3;
            this.drawFrame(frame, 0, screenX, screenY);
            return;
        }

        if (exposto.length === 1) {
            const angulo = { left: 0, up: 90, right: 180, down: 270 }[exposto[0]];
            this.drawFrame(3, angulo, screenX, screenY);
            return;
        }

        if (exposto.length === 2 && this.ehCanto(exposto)) {
            const chave = exposto.slice().sort().join("-");
            const angulo = {
                "left-up": 0,
                "right-up": 90,
                "down-right": 180,
                "down-left": 270
            }[chave];
            this.drawFrame(4, angulo, screenX, screenY);
            return;
        }

        const angulo = { left: 0, up: 90, right: 180, down: 270 }[exposto[0]];
        this.drawFrame(3, angulo, screenX, screenY);
    }

    drawFloor() {

        const camX = player.x - LARGURA / 2;
        const camY = player.y - ALTURA / 2;

        for (let row = 0; row < this.tilesY; row++) {
            for (let col = 0; col < this.tilesX; col++) {

                if (!this.tiles[row][col])
                    continue;

                const worldX = this.x + col * blocoTamanho;
                const worldY = this.y + row * blocoTamanho;

                const screenX = worldX - camX;
                const screenY = worldY - camY;

                this.drawTile(col, row, screenX, screenY);
            }
        }
    }
}