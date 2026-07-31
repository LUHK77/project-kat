// Bullet.js

import { ctx, blocoTamanho, ehSolido, LARGURA, ALTURA } from '../map.js';
import { player } from './Player.js';
import { enemies } from './Enemy.js';
// A classe Bullet representa uma bala no jogo, com propriedades e métodos para movimentação, colisão e desenho
export class Bullet {
    static sprite = new Image();
    // Carrega o sprite da bala, definindo a imagem que será usada para desenhar a bala na tela
    static carregarSprite() {
    Bullet.sprite.src = `assets/guns/bullet/sprite_0.png`;
    }
    // Construtor da classe Bullet, inicializando a posição, direção, velocidade, tamanho e outros atributos da bala
    constructor(
        x,
        y,
        angulo,
        dano,
        tamanhoSprite,
        owner = "player"
    ) {
        this.x = x;
        this.y = y;

        this.dx = Math.cos(angulo);
        this.dy = Math.sin(angulo);
        this.velocidade = 3;
        this.tamanho = 8;
        this.tamanhoSprite = tamanhoSprite || 40;

        this.dano = dano;
        this.owner = owner;

        this.acertou = false;
        this.timerDano = 0;
    }
    // Atualiza a posição da bala com base na direção e velocidade, verificando colisões com o mapa e inimigos/jogador
    update(deltaTime) {
        if (this.acertou) {
            this.timerDano--;
            return;
        }

        const passos = 3;

        const stepX =
            (this.dx * this.velocidade * 400 * deltaTime) / passos;

        const stepY =
            (this.dy * this.velocidade * 400 * deltaTime) / passos;

        for (let s = 0; s < passos; s++) {
            this.x += stepX;
            this.y += stepY;

            if (batuMapa(this.x, this.y)) {
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
                        const danoFinal =
                            this.dano + player.ataque;

                        e.hp -= danoFinal;
                        e.ultimoDano = Date.now();

                        if (e.hp <= 0) {
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
    // Desenha a bala na tela, aplicando a rotação correta com base na direção da bala e exibindo o dano causado se a bala acertou um alvo
    draw(camX, camY) {
        // Se a bala acertou um alvo, desenha o dano causado acima da posição da bala
        if (this.acertou) {
            const opacidade = this.timerDano / 40;

            ctx.fillStyle =
                this.owner === "player"
                    ? `rgba(255,255,255,${opacidade})`
                    : `rgba(255,100,100,${opacidade})`;

            ctx.font = "bold 14px GamerFonte";
            ctx.fillText(
                "-" + this.dano,
                this.x - camX,
                this.y - camY
            );
        } else {
            ctx.save();

            ctx.translate(
                this.x - camX,
                this.y - camY
            );

            ctx.rotate(
                Math.atan2(this.dy, this.dx)
            );
            
            ctx.drawImage(
                Bullet.sprite,
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

function batuMapa(x, y) {
    const col = Math.floor(x / blocoTamanho);
    const row = Math.floor(y / blocoTamanho);

    return ehSolido(col, row);
}
// Função para spawnar uma bala do jogador, criando uma nova instância da classe Bullet e adicionando-a à lista de balas
export function spawnBullet(
    angulo,
    dano,
    tamanhoSprite
) {
    bullets.push(
        new Bullet(
            player.x + Math.cos(angulo) * 20,
            player.y + Math.sin(angulo) * 20,
            angulo,
            dano + player.ataque,
            tamanhoSprite,
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
    tamanhoSprite = 40
) {
    bullets.push(
        new Bullet(
            x,
            y,
            angulo,
            dano,
            tamanhoSprite,
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