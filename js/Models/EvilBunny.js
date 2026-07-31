//js/Models/EvilBunny.js
import { ctx } from '../map.js';
import { player } from './Player.js';
import { Enemy, ESTADOS } from './Enemy.js';

export class EvilBunny extends Enemy {
    static frames     = new Image();
    static framesDano = new Image();
    // Carrega os sprites do inimigo EvilBunny, incluindo os frames normais e os frames de dano
    static carregarSprites() {
        EvilBunny.frames.src    = `assets/enemys/evil_bunny/move/EvilBunnyMove.webp`;
        EvilBunny.framesDano.src = `assets/enemys/evil_bunny/hit/EvilBunnyHit.webp`;
    }
    // Define os atributos específicos do inimigo EvilBunny
    constructor(x, y) {
        super(x, y);
        this.speed  = 2.5;
        this.hp     = 40;
        this.damage = 35;
        this.sprite = 64;
        this.xp    = 40;
    }
    // Desenha o inimigo EvilBunny na tela, aplicando a animação correta com base no estado de dano e na posição do jogador
    draw(camX, camY) {
        const spritesheet = this.estado === ESTADOS.HIT
                ? EvilBunny.framesDano
                : EvilBunny.frames;
    
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

EvilBunny.carregarSprites();