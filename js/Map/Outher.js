// js/Map/Room.js

import { ctx, blocoTamanho, LARGURA, ALTURA, registrarAreaEspecial } from '../map.js';
import { player } from '../Models/Player.js';
import { enemies } from '../Models/Enemy.js';
import { pausarTimer, retomarTimer } from '../ui.js';

export class Outher {
    constructor(tileX, tileY, widthTiles, heightTiles) {
        this.x      = tileX * blocoTamanho;
        this.y      = tileY * blocoTamanho;
        this.width  = widthTiles  * blocoTamanho;
        this.height = heightTiles * blocoTamanho;

        this.active        = false;
        this.complete      = false;
        this.playerInside  = false;

        // Avisa o map.js pra ignorar a colisão do terreno procedural dentro dessa sala
        registrarAreaEspecial(tileX, tileY, widthTiles, heightTiles);
    }

    isPlayerInside() {
        return (
            player.x >= this.x &&
            player.x <= this.x + this.width &&
            player.y >= this.y &&
            player.y <= this.y + this.height
        );
    }

    update() {
        const inside = this.isPlayerInside();

        if (inside && !this.playerInside) {
            this.playerInside = true;
            this.onEnter();
        }

        if (!inside && this.playerInside) {
            this.playerInside = false;
            this.onLeave();
        }
    }

    onEnter() {
        pausarTimer();
        enemies.length = 0;
        this.active = true;
    }

    onLeave() {
        retomarTimer();
        enemies.length = 0;
        this.active = false;
    }

    draw() {}
}

// ── MANAGEMENT ────────────────────────────────────────────────────────────────

export const rooms = [];

export function updateRooms() {
    for (const r of rooms) r.update();
}

export function drawRooms() {
    for (const r of rooms) r.draw(player.x, player.y);
}