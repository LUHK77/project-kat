// js/Models/Enemy.js
import { ctx, blocoTamanho, ehSolido, LARGURA, ALTURA, colideComObjetosSolidos } from '../map.js';
import { HealOrb } from '../Props/HealOrb.js';
import { props } from '../Props/Prop.js';
import { player } from './Player.js';

export const ESTADOS = {
    MOVE: 'move',
    HIT: 'hit'
};

// A classe Enemy representa um inimigo no jogo, com propriedades e métodos para movimentação, ataque e desenho
export class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.xp = 0;
        this.speed = 1.5;
        this.sprite = 64;
        this.damage = 10;
        this.hp = 40;
        this.knockback = 6;
        this.knockbackVX = 0; 
        this.knockbackVY = 0; 

        // Propriedades de animação do inimigo
        this.animacao = {
            frame: 0,
            timer: 0,
            velocidade: 3,
        };
        this.ultimoAtaque = 0;
        this.ultimoDano = 0;
        this.timerDano = 0;
    }

    onDeath() {
        if (Math.random() < 0.08) props.push(new HealOrb(this.x, this.y));
    }

    // Verifica se o inimigo colidiu com o mapa ou com o jogador, retornando true se houver colisão
    bateu(x, y) {
        const esquerda = Math.floor((x - this.size / 2) / blocoTamanho);
        const direita = Math.floor((x + this.size / 2) / blocoTamanho);
        const cima = Math.floor((y - 12 - this.size / 2) / blocoTamanho);
        const baixo = Math.floor((y + 12 + this.size / 2) / blocoTamanho);

        const bateuNoTerreno =
            ehSolido(esquerda, cima) ||
            ehSolido(direita, cima) ||
            ehSolido(esquerda, baixo) ||
            ehSolido(direita, baixo);

        const bateuNoPlayer =
            Math.abs(player.x - x) < (player.size / 2.8) + (this.size / 2) &&
            Math.abs(player.y - y) < (player.size / 2.8) + (this.size / 2);

        return bateuNoTerreno || bateuNoPlayer || colideComObjetosSolidos(x, y, this.size);
    }
    // Atualiza a animação do inimigo, avançando o frame com base no tempo decorrido
    updateAnimacao(deltaTime) {
        this.animacao.timer += deltaTime * 60;
        if (this.animacao.timer >= this.animacao.velocidade) {
            this.animacao.timer = 0;
            this.animacao.frame = (this.animacao.frame + 1) % 9;
        }

        const piscando = Date.now() - this.ultimoDano < 100;
        this.estado = piscando ? ESTADOS.HIT : ESTADOS.MOVE;
    }
    // Atualiza a posição e o estado do inimigo, movendo-o em direção ao jogador e aplicando dano se estiver próximo
    update(deltaTime) {
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        this.updateAnimacao(deltaTime);

        if (this.timerDano > 0) this.timerDano--;

        //Calcula o knockback do inimigo
        if (Math.abs(this.knockbackVX) > 0.01 || Math.abs(this.knockbackVY) > 0.01) {
        const novoX = this.x + this.knockbackVX;
        const novoY = this.y + this.knockbackVY;

        if (!this.bateu(novoX, this.y)) this.x = novoX;
        if (!this.bateu(this.x, novoY)) this.y = novoY;

        // decai a velocidade suavemente a cada frame (85% do valor anterior)
        this.knockbackVX *= 0.85;
        this.knockbackVY *= 0.85;
        }

        //Verifica se o inimigo está colidindo com o jogador e aplica dano se necessário
        if (dist < (player.size / 2) + (this.size / 2)) {
            const agora = Date.now();
            if (agora - this.ultimoAtaque > 1000) {
                player.hp -= this.damage;
                player.ultimoDano = agora;
                this.ultimoAtaque = agora;
            }
            // knockback: empurra o player pra longe do inimigo
            if (dist > 0) {
            const dirX = (player.x - this.x) / dist;
            const dirY = (player.y - this.y) / dist;
            player.knockbackVX = dirX * this.knockback;
            player.knockbackVY = dirY * this.knockback;
            }
        }

        // Move o inimigo em direção ao jogador, evitando colisões com o mapa
        if (dist < 1) return;

        const vx = (dx / dist) * this.speed * 100 * deltaTime;
        const vy = (dy / dist) * this.speed * 100 * deltaTime;

        if (!this.bateu(this.x + vx, this.y)) this.x += vx;
        if (!this.bateu(this.x, this.y + vy)) this.y += vy;
    }
    // Função de desenho do inimigo, que deve ser implementada nas subclasses específicas de inimigos
    draw(camX, camY) { }
}

// ── GERENCIAMENTO ─────────────────────────────────────────────────────────────

export const enemies = [];
// Atualiza todos os inimigos spawnados, chamando o método update de cada um com base no tempo decorrido
export function updateEnemies(deltaTime) {
    for (const e of enemies) e.update(deltaTime);
}
// Desenha todos os inimigos spawnados, chamando o método draw de cada um com base na posição da câmera
export function drawEnemies() {
    const camX = player.x - LARGURA / 2;
    const camY = player.y - ALTURA / 2;
    for (const e of enemies) e.draw(camX, camY);
}