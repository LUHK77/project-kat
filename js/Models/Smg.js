// js/Models/Pistol.js

import { ctx, LARGURA, ALTURA } from '../map.js';
import { Gun, ESTADOS_GUN, mouse, angulo } from './Gun.js';

export class Smg extends Gun {
    static spriteIdle   = new Image();
    static framesShot   = new Image();
    static framesReload = new Image();

    static carregarSprites() {
        Smg.spriteIdle.src   = `assets/guns/smg/SMGIdle.webp`;
        Smg.framesReload.src = `assets/guns/smg/smgReload/SMGReload.webp`;
        Smg.framesShot.src   = `assets/guns/smg/smgShoot/SMGShoot.webp`;
    }

    constructor() {
        super();
        this.dano        = 2;
        this.sprite      = 50;
        this.spriteRecoil = 30;
        this.cadencia    = 200;
        this.balas       = 20;
        this.maxBalas    = 20;
        this.tempoRecarga = 2500;
        this.tamanhoBalas = 30;

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
            spritesheet = Smg.framesReload;
            tamanho     = this.spriteRecoil;
        } else if (this.atirando) {
            spritesheet = Smg.framesShot;
            tamanho     = this.sprite;
        } else {
            // Idle é imagem única, desenha direto
            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(angulo);
            if (mouse.x < px) ctx.scale(1, -1);
            ctx.drawImage(Smg.spriteIdle, -15, -this.sprite / 2 + 5, this.sprite, this.sprite);
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

Smg.carregarSprites();
export const smg = new Smg();