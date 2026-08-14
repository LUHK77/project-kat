// ZombieBird.js

import { ctx } from '../map.js';
import { player } from './Player.js';
import { Enemy, ESTADOS } from './Enemy.js';
import { spawnEnemyBullet } from './Bullet.js';

export class ZombieBird extends Enemy {
    static frames     = new Image();
    static framesDano = new Image();
    static frameBullet = new Image();
    // Carrega os sprites do inimigo Zombie Bird, incluindo os frames normais e os frames de dano
    static carregarSprites() {
        ZombieBird.frames.src    = `assets/enemys/zombie_bird/move/Bird_ZombieMove.webp`;
        ZombieBird.framesDano.src = `assets/enemys/zombie_bird/hit/Bird_ZombieHit.webp`;
        ZombieBird.frameBullet.src = `assets/guns/bullet/bulletEnemy.webp`
    }
    // Define os atributos específicos do inimigo Zombie Bird
    constructor(x, y) {
        super(x, y);

        this.speed = 1.2;
        this.hp = 40;
        this.damage = 15;
        this.sprite = 64;
        this.xp = 30;
        this.speedBullet = 0.8;
        this.spriteBullet = ZombieBird.frameBullet;

        // ataque à distância
        this.attackCooldown = 2000; 
        this.lastAttack = 0;

        // distância máxima para atacar
        this.attackRange = 600;
    }

    getBulletSprite(){
        return ZombieBird.frameBullet;
    }
    // metodo que atualiza a pocição o Zombie Bird de acordo com a do player
    update(deltaTime) {
        super.update(deltaTime);

        const dist = Math.hypot(
            player.x - this.x,
            player.y - this.y
        );

        const agora = Date.now();
        // verifica se o player esta no renge do ataque e o ataca se estiver
        if (
            dist <= this.attackRange &&
            agora - this.lastAttack >= this.attackCooldown
        ) {
            this.shoot();
            this.lastAttack = agora;
        }
    }
    // metodo de ataque especial a distancia do Zombie Bird
    shoot() {
        const angulo = Math.atan2(
            player.y - this.y,
            player.x - this.x
        );

        spawnEnemyBullet(
            this.x,
            this.y,
            angulo,
            this.damage,
            this.speedBullet,
            this.spriteBullet,
            32,
            this.knockback
        );
    }
    // Desenha o inimigo Zombie Bird na tela, aplicando a animação correta com base no estado de dano e na posição do jogador
    draw(camX, camY) {
        const spritesheet = this.estado === ESTADOS.HIT
                ? ZombieBird.framesDano
                : ZombieBird.frames;
    
            const colunas = 3;
            const frameW  = 32;
            const frameH  = 32;
            const col = this.animacao.frame % colunas;
            const row = Math.floor(this.animacao.frame / colunas);

        ctx.save();

        ctx.translate(
            this.x - camX,
            this.y - camY
        );

        if (player.x < this.x) {
            ctx.scale(-1, 1);
        }

        ctx.drawImage(spritesheet, col * frameW, row * frameH, frameW, frameH, -this.sprite / 2, -this.sprite / 2, this.sprite, this.sprite);

        ctx.restore();
    }
}

ZombieBird.carregarSprites();