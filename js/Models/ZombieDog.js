// zombie_dog.js
import { ctx } from '../map.js';
import { player } from './Player.js';
import { Enemy, ESTADOS } from './Enemy.js'; // importa ESTADOS do Enemy

export class ZombieDog extends Enemy {
    static frames     = new Image();
    static framesDano = new Image();

    static carregarSprites() {
        ZombieDog.frames.src    = `assets/enemys/zombie_dog/move/ZombieDogMove.webp`;
        ZombieDog.framesDano.src = `assets/enemys/zombie_dog/hit/ZombieDogHit.webp`;
    }
    // Define os atributos específicos do inimigo Zombie Dog
    constructor(x, y) {
        super(x, y);
        this.speed  = 2;
        this.hp     = 120;
        this.damage = 30;
        this.sprite = 96;
        this.size   = 30;
        this.xp     = 60;
    }
    // Desenha o inimigo Zombie Dog na tela, aplicando a animação correta com base no estado de dano e na posição do jogador
    draw(camX, camY) {
        const spritesheet = this.estado === ESTADOS.HIT
            ? ZombieDog.framesDano
            : ZombieDog.frames;

        const colunas = 3;
        const frameW  = 32;
        const frameH  = 32;
        const col = this.animacao.frame % colunas;
        const row = Math.floor(this.animacao.frame / colunas);

        ctx.save();
        ctx.translate(this.x - camX, this.y - camY);
        if (player.x < this.x) ctx.scale(-1, 1);
        ctx.drawImage(spritesheet, col * frameW, row * frameH, frameW, frameH, -this.sprite / 2, -this.sprite / 2, this.sprite, this.sprite);
        ctx.restore();
    }
}

ZombieDog.carregarSprites();