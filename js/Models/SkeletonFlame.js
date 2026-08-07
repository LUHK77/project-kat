// zombie.js
import { ctx } from '../map.js';
import { player } from './Player.js';
import { Enemy, ESTADOS } from './Enemy.js';

export class SkeletonFlame extends Enemy {
    static frames     = new Image();
    static framesDano = new Image();
    // Carrega os sprites do inimigo Zombie, incluindo os frames normais e os frames de dano
    static carregarSprites() {
        SkeletonFlame.frames.src    = `assets/enemys/skeleton_flames/move/skeletonFlameMove.webp`;
        SkeletonFlame.framesDano.src = `assets/enemys/skeleton_flames/hit/skeletonFlameHit.webp`;
    }
    // Define os atributos específicos do inimigo Zombie
    constructor(x, y) {
        super(x, y);
        this.speed  = 2;
        this.hp     = 300;
        this.damage = 25;
        this.sprite = 92;
        this.size   = 30;
        this.xp    = 200;
    }
    // Desenha o inimigo Zombie na tela, aplicando a animação correta com base no estado de dano e na posição do jogador
    draw(camX, camY) {
            const spritesheet = this.estado === ESTADOS.HIT
                ? SkeletonFlame.framesDano
                : SkeletonFlame.frames;
    
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

SkeletonFlame.carregarSprites();