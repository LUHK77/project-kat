// js/Models/Gun.js

import { ctx, canvas, LARGURA, ALTURA } from '../map.js';
import { player } from './Player.js';
import { spawnBullet } from './Bullet.js';

export const mouse = { x: 0, y: 0 };
export let angulo = 0;

// Atualiza a posição do mouse e calcula o ângulo em relação ao centro do canvas
window.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    angulo = Math.atan2(mouse.y - ALTURA / 2, mouse.x - LARGURA / 2);
});

// Estados possíveis da arma
export const ESTADOS_GUN = {
    IDLE:   'idle',
    SHOOT:  'shoot',
    RELOAD: 'reload'
};

// Classe Gun representa uma arma no jogo, com propriedades e métodos
export class Gun {
    constructor() {
        this.dano = 0;
        this.speedBullet = 2;
        this.knockback = 3;
        this.sprite = 0;
        this.spriteBullet = "";
        this.spriteRecoil = 0;
        this.cadencia = 0;
        this.ultimoTiro = 0;
        this.atirando = false;
        this.segurando = false;
        this.balas = 0;
        this.maxBalas = 0;
        this.recarregando = false;
        this.tempoRecarga = 0;
        this.inicioRecarga = 0;
        this.tamanhoBalas = 0;
        this.estado = ESTADOS_GUN.IDLE;

        // Propriedades de animação da arma
        this.animacao = {
            frame: 0,
            timer: 0,
            velocidade: 2,
        };
    }

    getBulletSprite(){}

    // Recarrega a arma, iniciando o processo de recarga se necessário
    recarregar() {
        if (this.recarregando || this.balas >= this.maxBalas) return;
        this.recarregando = true;
        this.atirando = false;
        this.inicioRecarga = Date.now();
        this.animacao.frame = 0;
        this.animacao.timer = 0;
    }

    // Realiza o disparo da arma, verificando se é possível atirar e criando uma bala na direção do ângulo fornecido
    atirar(angulo) {
        if (this.recarregando) return;

        // Garante que a arma tenha um limite de tiro por segundo, baseado na cadência
        const agora = Date.now();
        if (agora - this.ultimoTiro < this.cadencia) return;

        this.ultimoTiro = agora;
        this.atirando = true;
        this.balas--;
        this.animacao.frame = 0;
        this.animacao.timer = 0;

        // Cria uma bala na direção do ângulo fornecido, com o dano e tamanho especificados
        spawnBullet(angulo, this.dano, this.speedBullet, this.spriteBullet,this.tamanhoBalas, this.knockback);

        if (this.balas <= 0) {
            this.recarregar();
        }
    }
    getSprite() {
    return this.constructor.spriteIdle;
    }

    // Atualiza o estado da arma, incluindo animação, recarga e disparo automático
    update(deltaTime, angulo) {
        const agora = Date.now();

        if (this.recarregando) {
            // Avança a animação de recarga
            this.animacao.timer += deltaTime * 60;
            if (this.animacao.timer >= this.animacao.velocidade) {
                this.animacao.timer = 0;
                this.animacao.frame = (this.animacao.frame + 1) % 8;
            }
            // Finaliza a recarga quando o tempo necessário tiver passado
            if (agora - this.inicioRecarga >= this.tempoRecarga) {
                this.recarregando = false;
                this.balas = this.maxBalas;
                this.animacao.frame = 0;
            }

            // Atualiza o estado pra reload
            this.estado = ESTADOS_GUN.RELOAD;
            return;
        }

        // Atira automaticamente enquanto segura o botão
        if (this.segurando) {
            this.atirar(angulo);
        }

        if (this.atirando) {
            // Avança a animação de disparo
            this.animacao.timer += deltaTime * 60;
            if (this.animacao.timer >= this.animacao.velocidade) {
                this.animacao.timer = 0;
                this.animacao.frame++;
                if (this.animacao.frame >= 8) {
                    this.animacao.frame = 0;
                    this.atirando = false;
                }
            }
        }

        // Atualiza o estado baseado na situação atual
        if (this.atirando)      this.estado = ESTADOS_GUN.SHOOT;
        else                    this.estado = ESTADOS_GUN.IDLE;
    }

    // Apenas um método de desenho vazio, que será implementado nas subclasses específicas de armas
    draw() {}

    // Desenha a barra de munição da arma na tela, mostrando a quantidade de balas restantes e o estado de recarga
    drawBarra() {
        const px = LARGURA / 2;
        const py = ALTURA  / 2;
        const barraX = px - 20;
        const barraY = py + player.sprite / 2 + 8;
        const barraW = 40;
        const barraH = 6;

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(barraX, barraY, barraW, barraH);

        ctx.fillStyle = this.recarregando ? "gray" : "white";
        ctx.fillRect(barraX, barraY, barraW * (this.balas / this.maxBalas), barraH);

        ctx.strokeStyle = "white";
        ctx.lineWidth = 1;
        ctx.strokeRect(barraX, barraY, barraW, barraH);
    }
}