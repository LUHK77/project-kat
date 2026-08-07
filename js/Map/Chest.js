import { ctx, blocoTamanho, LARGURA, ALTURA } from "../map.js";
import { player } from "../Models/Player.js";
import { WorldObject } from "./WorldObject.js";

import { Pistol } from "../Models/Pistol.js";
import { Smg } from "../Models/Smg.js";

const ESTADO_BAU = {
    FECHADO: 0,
    ABRINDO: 1,
    ABERTO: 2
};

const FRAME_W = 32;
const FRAME_H = 32;
const FRAME_COLS = 2;
const TOTAL_FRAMES = 6;
const DURACAO_ANIM_MS = 700;

const ARMAS = [
    Pistol,
    Smg
];

export class Chest extends WorldObject {

    static sheet = new Image();

    static carregarAssets() {
        Chest.sheet.src = "assets/map/ruinas/Bau.webp";
    }

    constructor(worldX, worldY, { bloqueado = false, onInteragir, onAbrir } = {}) {

        super(worldX, worldY);

        this.spriteSize = blocoTamanho / 1.5;
        this.hitboxSize = blocoTamanho / 1.5;

        this.bloqueado = bloqueado;
        this.onInteragir = onInteragir;
        this.onAbrir = onAbrir;

        this.estado = ESTADO_BAU.FECHADO;

        this.abrindoDesde = 0;
        this.frameAtual = 0;

        this.interagiu = false;
    }

    isSolid() {
        return true;
    }

    getHitbox() {
        return {
            x: this.x - this.hitboxSize / 2,
            y: this.y - this.hitboxSize / 2,
            width: this.hitboxSize,
            height: this.hitboxSize
        };
    }

    isTouchingPlayer() {
        return Math.hypot(
            player.x - this.x,
            player.y - this.y
        ) < this.hitboxSize + 13;
    }

    desbloquear() {
        this.bloqueado = false;
    }

    abrir() {

        if (this.estado !== ESTADO_BAU.FECHADO)
            return;

        this.estado = ESTADO_BAU.ABRINDO;
        this.abrindoDesde = Date.now();
    }

    update() {

        if (this.estado === ESTADO_BAU.FECHADO) {

            if (this.isTouchingPlayer()) {

                if (this.bloqueado) {

                    if (!this.interagiu) {
                        this.interagiu = true;
                        this.onInteragir?.();
                    }

                } else {

                    this.abrir();

                }
            }

            return;
        }

        if (this.estado === ESTADO_BAU.ABRINDO) {

            const decorrido = Date.now() - this.abrindoDesde;
            const passo = DURACAO_ANIM_MS / TOTAL_FRAMES;

            this.frameAtual = Math.min(
                TOTAL_FRAMES - 1,
                Math.floor(decorrido / passo)
            );

            if (decorrido >= DURACAO_ANIM_MS) {

                this.estado = ESTADO_BAU.ABERTO;
                this.frameAtual = TOTAL_FRAMES - 1;

                const WeaponClass = ARMAS[
                    Math.floor(Math.random() * ARMAS.length)
                ];

                this.onAbrir?.(new WeaponClass());
            }
        }
    }

    draw() {

        const camX = player.x - LARGURA / 2;
        const camY = player.y - ALTURA / 2;

        const screenX = this.x - camX - this.spriteSize / 2;
        const screenY = this.y - camY - this.spriteSize / 2;

        const col = this.frameAtual % FRAME_COLS;
        const row = Math.floor(this.frameAtual / FRAME_COLS);

        ctx.drawImage(
            Chest.sheet,
            col * FRAME_W,
            row * FRAME_H,
            FRAME_W,
            FRAME_H,
            screenX,
            screenY,
            this.spriteSize,
            this.spriteSize
        );
    }
}

Chest.carregarAssets();