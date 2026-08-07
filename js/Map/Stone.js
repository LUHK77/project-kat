// js/Map/Stone.js

import { blocoTamanho, ctx, LARGURA, ALTURA } from "../map.js";
import { player } from "../Models/Player.js";
import { WorldObject } from "./WorldObject.js";
import { hash2D } from "../utils/hash.js";

const FRAME_SIZE = 50; 
const FRAME_COLS = 2; 

export class Stone extends WorldObject {

    static sheet = new Image();

    static carregarAssets() {
        Stone.sheet.src = "assets/map/stone/stoneNew.webp"; 
    }

    constructor(tileX, tileY) {

        const worldX = tileX * blocoTamanho + blocoTamanho / 2;
        const worldY = tileY * blocoTamanho + blocoTamanho / 2;

        super(worldX, worldY);

        this.spriteSize = blocoTamanho * 2;

        // variação determinística — mesma pedra sempre com a mesma variação
        this.variacao = hash2D(tileX, tileY) % 3;
    }

    isSolid() {
        return true;
    }

    getHitbox() {

        const hbWidth  = this.spriteSize * 0.50;
        const hbHeight = this.spriteSize * 0.50;

        return {
            x: this.x - hbWidth / 2,
            y: this.y + this.spriteSize / 2 - hbHeight,
            width: hbWidth,
            height: hbHeight
        };
    }

    draw() {

        const camX = player.x - LARGURA / 2;
        const camY = player.y - ALTURA / 2;

        const screenX = this.x - camX - this.spriteSize / 2;
        const screenY = this.y - camY - this.spriteSize / 2;

        const col = this.variacao % FRAME_COLS;
        const row = Math.floor(this.variacao / FRAME_COLS);

        ctx.drawImage(
            Stone.sheet,
            col * FRAME_SIZE,
            row * FRAME_SIZE,
            FRAME_SIZE,
            FRAME_SIZE,
            screenX, screenY,
            this.spriteSize, this.spriteSize
        );
    }

}

Stone.carregarAssets();