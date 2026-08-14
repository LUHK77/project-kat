// js/Props/HealOrb.js

import { ctx, LARGURA, ALTURA } from "../map.js";
import { player } from "../Models/Player.js";
import { Prop } from "./Prop.js";

const FRAME_W = 32;
const FRAME_H = 32;
const FRAME_COLS = 2;
const TOTAL_FRAMES = 6;

export class HealOrb extends Prop {

    static sheet = new Image();

    static carregarSprite() {
        HealOrb.sheet.src = "assets/props/heal_orb/HealOrb.webp";
    }

    constructor(x, y) {
        super(x, y, 32);

        this.animacao = {
            frame: 0,
            timer: 0,
            velocidade: 8
        };

        this.cura = 35;
    }

    update(deltaTime) {

        super.update();

        this.animacao.timer += deltaTime * 60;

        if (this.animacao.timer >= this.animacao.velocidade) {

            this.animacao.timer = 0;

            this.animacao.frame =
                (this.animacao.frame + 1) % TOTAL_FRAMES;
        }
    }

    onPickup() {
        if(player.hp == player.maxHp) return;
        if(player.hp + this.cura >= player.maxHp) return player.hp = player.maxHp;
        player.hp += this.cura;
    }

    draw() {

        const camX = player.x - LARGURA / 2;
        const camY = player.y - ALTURA / 2;

        const col = this.animacao.frame % FRAME_COLS;
        const row = Math.floor(this.animacao.frame / FRAME_COLS);

        ctx.drawImage(
            HealOrb.sheet,
            col * FRAME_W,
            row * FRAME_H,
            FRAME_W,
            FRAME_H,
            this.x - camX - this.spriteSize / 2,
            this.y - camY - this.spriteSize / 2,
            this.spriteSize,
            this.spriteSize
        );
    }
}

HealOrb.carregarSprite();