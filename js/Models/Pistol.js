// js/Models/Pistol.js

import { ctx, LARGURA, ALTURA } from '../map.js';
import { Gun, ESTADOS_GUN, mouse, angulo } from './Gun.js';

export class Pistol extends Gun {
    static spriteIdle   = new Image();
    static framesShot   = new Image();
    static framesReload = new Image();

    static carregarSprites() {
        Pistol.spriteIdle.src   = `assets/guns/pistol/pistolD.png`;
        Pistol.framesReload.src = `assets/guns/pistol/pistolReload/PistolReload.webp`;
        Pistol.framesShot.src   = `assets/guns/pistol/pistolShot/PistolShoot.webp`;
    }

    constructor() {
        super();
        this.dano        = 10;
        this.sprite      = 50;
        this.spriteRecoil = 30;
        this.cadencia    = 500;
        this.balas       = 6;
        this.maxBalas    = 6;
        this.tempoRecarga = 1500;
        this.tamanhoBalas = 60;

        // Colunas e tamanho de frame de cada spritesheet
        this.colunas = 3; // ajusta conforme sua spritesheet
        this.frameW  = 32;
        this.frameH  = 32;
    }

    draw() {
        const px = LARGURA / 2;
        const py = ALTURA  / 2;

        // Escolhe spritesheet e tamanho pelo estado
        let spritesheet;
        let tamanho;

        if (this.recarregando) {
            spritesheet = Pistol.framesReload;
            tamanho     = this.spriteRecoil;
        } else if (this.atirando) {
            spritesheet = Pistol.framesShot;
            tamanho     = this.sprite;
        } else {
            // Idle é imagem única, desenha direto
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angulo);
            if (mouse.x < px) ctx.scale(1, -1);
            ctx.drawImage(Pistol.spriteIdle, -15, -this.sprite / 2 + 5, this.sprite, this.sprite);
            ctx.restore();
            return;
        }

        const col = this.animacao.frame % this.colunas;
        const row = Math.floor(this.animacao.frame / this.colunas);

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(angulo);
        if (mouse.x < px) ctx.scale(1, -1);
        ctx.drawImage(spritesheet, col * this.frameW, row * this.frameH, this.frameW, this.frameH, -15, -tamanho / 2 + 5, tamanho, tamanho);
        ctx.restore();
    }
}

Pistol.carregarSprites();
export const pistol = new Pistol();