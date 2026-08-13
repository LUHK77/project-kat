// js/Map/Ruins.js

import { ctx, blocoTamanho, ALTURA, LARGURA, registrarAreaEspecial } from "../map.js";
import { player } from "../Models/Player.js";
import { enemies } from "../Models/Enemy.js";
import { hash2D, novaSeed } from "../utils/hash.js";
import { Chest } from "./Chest.js";
import { SkeletonFlame } from "../Models/SkeletonFlame.js";
import { WeaponDrop } from "../Props/WeaponDrop.js";
import { props } from "../Props/Prop.js";
import { gerarAreas } from "../utils/gerarAreas.js";

const ESTADO = {
    ESPERANDO: 0,
    COMBATE: 1,
    CONCLUIDA: 2
};

const sala = gerarAreas();

export class Ruins {

    static floor = new Image();

    static carregarAssets() {
        Ruins.floor.src = "assets/map/ruinas/stoneFloor.webp";
    }

    constructor(tileX, tileY, seed) {

        // tamanho da sala (em tiles)
        this.tilesX = sala.largura;
        this.tilesY = sala.altura;
        this.tiles = sala.tiles;
        this.seed;

        // posição (em pixels)
        this.x = tileX * blocoTamanho;
        this.y = tileY * blocoTamanho;

        this.width = this.tilesX * blocoTamanho;
        this.height = this.tilesY * blocoTamanho;

        registrarAreaEspecial(tileX, tileY, this.tilesX, this.tilesY, this);

        // estado da sala
        this.estado = ESTADO.ESPERANDO;

        // inimigos pertencentes à sala
        this.enemies = [];

        // seed para variar o piso
        this.seed = novaSeed();

        // baú no centro da sala
        const chestX = this.x + this.width / 2;
        const chestY = this.y + this.height / 2;

        this.chest = new Chest(chestX, chestY, {
            bloqueado: true,

            onInteragir: () => {

                if (this.estado !== ESTADO.ESPERANDO)
                    return;

                this.estado = ESTADO.COMBATE;

                this.spawnEnemies();
            },

            onAbrir: (weapon) => {

                props.push(
                    new WeaponDrop(
                        this.chest.x,
                        this.chest.y - 15,
                        weapon
                    )
                );

            }
        });
    }

    getSolidObjects() {
        return [this.chest];
    }

    spawnEnemies() {

        const quantidade = 2;

        for (let i = 0; i < quantidade; i++) {

            const angulo = Math.random() * Math.PI * 2;
            const distancia = 400 + Math.random() * 200;

            const x = player.x + Math.cos(angulo) * distancia;
            const y = player.y + Math.sin(angulo) * distancia;

            const e = new SkeletonFlame(x, y);

            enemies.push(e);
            this.enemies.push(e);
        }
    }

    update() {

        this.chest.update();

        if (this.estado !== ESTADO.COMBATE)
            return;

        // Remove da lista da sala quem já morreu
        this.enemies = this.enemies.filter(enemy =>
            enemies.includes(enemy)
        );
        if (this.enemies.length === 0) {

            this.estado = ESTADO.CONCLUIDA;

            this.chest.abrir();
        }
    }

    drawFloor() {

    const camX = player.x - LARGURA / 2;
    const camY = player.y - ALTURA / 2;

    for (let row = 0; row < this.tilesY; row++) {

        for (let col = 0; col < this.tilesX; col++) {

            if (!this.tiles[row][col])
                continue; // pula os cantos "removidos"

            const worldX = this.x + col * blocoTamanho;
            const worldY = this.y + row * blocoTamanho;

            const screenX = worldX - camX;
            const screenY = worldY - camY;

            const frame = hash2D(col, row, this.seed) % 3;
            const frameCol = frame % 2;
            const frameRow = Math.floor(frame / 2);

            ctx.drawImage(
                Ruins.floor,
                frameCol * 32,
                frameRow * 32,
                32,
                32,
                screenX,
                screenY,
                blocoTamanho,
                blocoTamanho
            );
        }
    }
}

    draw() {
        this.drawFloor();
        this.chest.draw();

    }

}

Ruins.carregarAssets();