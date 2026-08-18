// Bullet.js

import { ctx, blocoTamanho, ehSolido, LARGURA, ALTURA, colideComObjetosSolidos } from '../map.js';
import { player } from './Player.js';
import { enemies } from './Enemy.js';
// A classe Bullet representa uma bala no jogo, com propriedades e métodos para movimentação, colisão e desenho
export class Bullet {
    static impactSprite = new Image();

    // Carrega os sprites da bala e do impacto, definindo as imagens que serão usadas para desenhar na tela
    static carregarSprite() {
        Bullet.impactSprite.src = `assets/guns/bullet/bulletImpact.webp`;
    }

    static BULLET_FRAME_SIZE = 32;
    static BULLET_FRAMES = 6;   
    static BULLET_COLS = 2;

    static IMPACT_FRAME_SIZE = 32;
    static IMPACT_FRAMES = 8;
    static IMPACT_COLS = 3;

    // Construtor da classe Bullet, inicializando a posição, direção, velocidade, tamanho e outros atributos da bala
    constructor(
        x,
        y,
        angulo,
        dano,
        speed,
        spriteB,
        tamanhoSprite,
        knockback,
        owner = "player"
    ) {
        this.x = x;
        this.y = y;

        this.dx = Math.cos(angulo);
        this.dy = Math.sin(angulo);
        this.velocidade = speed;
        this.tamanho = 8;
        this.spriteB = spriteB;
        this.tamanhoSprite = tamanhoSprite || 40;
        this.knockback = knockback;

        this.dano = dano;
        this.owner = owner;

        this.acertou = false;
        this.timerDano = 0;
        this.frameTimer = 0;

    }

    // Atualiza a posição da bala com base na direção e velocidade, verificando colisões com o mapa e inimigos/jogador
    update(deltaTime) {
        if (this.acertou) {
            this.timerDano--;
            return;
        }
        this.frameTimer += deltaTime;

        const passos = 3;

        const stepX =
            (this.dx * this.velocidade * 400 * deltaTime) / passos;

        const stepY =
            (this.dy * this.velocidade * 400 * deltaTime) / passos;

        for (let s = 0; s < passos; s++) {
            this.x += stepX;
            this.y += stepY;

            if (bateuMapa(this.x, this.y, this.tamanho)) {
                this.acertou = true;
                this.timerDano = 0;
                break;
            }
            //bala do jogador
            if (this.owner === "player") {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];

                    const dist = Math.hypot(
                        this.x - e.x,
                        this.y - e.y
                    );
                    // Se a bala do jogador colidir com um inimigo, aplica o dano da arma somado ao do player
                    if (dist < e.size / 2 + this.tamanho) {
                        const danoFinal = this.dano;

                        const forca = (this.knockback * 50) / e.size;
                        e.knockbackVX += this.dx * forca;
                        e.knockbackVY += this.dy * forca;

                        e.hp -= danoFinal;
                        e.ultimoDano = Date.now();
                        if (e.hp <= 0) {
                            e.onDeath();
                            enemies.splice(j, 1);
                            player.ganharXP(e.xp);
                        }

                        this.acertou = true;
                        this.timerDano = 40;
                        break;
                    }
                }
            }
            //bala do inimigo
            else {
                const dist = Math.hypot(
                    this.x - player.x,
                    this.y - player.y
                );

                if (dist < player.size / 2 + this.tamanho) {
                    const agora = Date.now();
                    const forcaE = (this.knockback * 50) / player.size;
                        player.knockbackVX += this.dx * forcaE;
                        player.knockbackVY += this.dy * forcaE;
                        
                    player.hp -= this.dano;

                    this.acertou = true;
                    player.ultimoDano = agora;
                    this.timerDano = 40;
                    break;
                }
            }

            if (this.acertou) break;
        }
    }

    drawImpactBullet(camX, camY) {
        const progresso = 1 - (this.timerDano / 40);
        const velocidadeAnimação = 2.2

        // qual frame mostrar (0 a 5), sem passar do último
        const frame = Math.min(
            Bullet.IMPACT_FRAMES - 1,
            Math.floor(progresso * Bullet.IMPACT_FRAMES)
        );

        const col = frame % Bullet.IMPACT_COLS;
        const row = Math.floor(frame / Bullet.IMPACT_COLS * velocidadeAnimação);

        const screenX = this.x - camX;
        const screenY = this.y - camY;

        const tamanhoDesenho = 50;

        ctx.drawImage(
            Bullet.impactSprite,
            col * Bullet.IMPACT_FRAME_SIZE, row * Bullet.IMPACT_FRAME_SIZE, // recorte agora usa linha E coluna
            Bullet.IMPACT_FRAME_SIZE, Bullet.IMPACT_FRAME_SIZE,
            screenX - tamanhoDesenho / 2,
            screenY - tamanhoDesenho / 2,
            tamanhoDesenho, tamanhoDesenho
        );
    }


    draw(camX, camY) {
        // Se a bala acertou um alvo, desenha o impacto e o dano causado acima da posição da bala
        if (this.acertou) {
            this.drawImpactBullet(camX, camY);

            const opacidade = this.timerDano / 40;

            ctx.fillStyle =
                this.owner === "player"
                    ? `rgba(255,255,255,${opacidade})`
                    : `rgba(255,100,100,${opacidade})`;

            ctx.font = "bold 14px GamerFonte";
            ctx.fillText(
                this.dano,
                this.x - camX,
                this.y - camY - 30
            );
        } else {
            ctx.save();

            ctx.translate(this.x - camX, this.y - camY);
            ctx.rotate(Math.atan2(this.dy, this.dx));

            const velocidadeAnimacao = 15; // frames por segundo (ajuste ao gosto)
            const frame = Math.floor(this.frameTimer * velocidadeAnimacao) % Bullet.BULLET_FRAMES;

            const col = frame % Bullet.BULLET_COLS;
            const row = Math.floor(frame / Bullet.BULLET_COLS);

            ctx.drawImage(
                this.spriteB,
                col * Bullet.BULLET_FRAME_SIZE, row * Bullet.BULLET_FRAME_SIZE, // recorte: coluna e linha
                Bullet.BULLET_FRAME_SIZE, Bullet.BULLET_FRAME_SIZE,
                -this.tamanhoSprite / 2,
                -this.tamanhoSprite / 2,
                this.tamanhoSprite,
                this.tamanhoSprite
            );

            ctx.restore();
        }
    }
}

Bullet.carregarSprite();

const bullets = [];

function bateuMapa(x, y, tamanho) {
    const col = Math.floor(x / blocoTamanho);
    const row = Math.floor(y / blocoTamanho);

    return ehSolido(col, row) || colideComObjetosSolidos(x, y, tamanho);
}
// Função para spawnar uma bala do jogador, criando uma nova instância da classe Bullet e adicionando-a à lista de balas
export function spawnBullet(angulo,dano,speed,spriteB ,tamanhoSprite, knockback) {
    bullets.push(
        new Bullet(
            player.x + Math.cos(angulo) * 20,
            player.y + Math.sin(angulo) * 20,
            angulo,
            dano + player.ataque,
            speed,
            spriteB,
            tamanhoSprite,
            knockback,
            "player"
        )
    );
}
// Função para spawnar uma bala de inimigo, criando uma nova instância da classe Bullet e adicionando-a à lista de balas
export function spawnEnemyBullet(
    x,
    y,
    angulo,
    dano = 10,
    speed,
    spriteB,
    tamanhoSprite = 20,
    knockback,
) {
    bullets.push(
        new Bullet(
            x,
            y,
            angulo,
            dano,
            speed,
            spriteB,
            tamanhoSprite,
            knockback,
            "enemy"
        )
    );
}
// Atualiza todas as balas na lista, chamando o método update de cada bala e removendo as balas que acertaram um alvo e cujo timer de dano expirou
export function updateBullets(deltaTime) {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].update(deltaTime);

        if (
            bullets[i].acertou &&
            bullets[i].timerDano <= 0
        ) {
            bullets.splice(i, 1);
        }
    }
}
// Desenha todas as balas na lista, chamando o método draw de cada bala e passando as coordenadas da câmera para ajustar a posição na tela
export function drawBullets() {
    const camX = player.x - LARGURA / 2;
    const camY = player.y - ALTURA / 2;

    for (const b of bullets) {
        b.draw(camX, camY);
    }
}