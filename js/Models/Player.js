// js/Models/Player.js
import { ctx, blocoTamanho, ehSolido, LARGURA, ALTURA, colideComObjetosSolidos } from '../map.js';
import { abrirUpgrade } from '../upgradeUI.js';
import { desenharSombra } from '../utils/desenharSombras.js';
import { pistol } from './Pistol.js';

const retrato = new Image();
retrato.src = "assets/player/PlayerIcon.png";

// Estados possíveis do player
const ESTADOS = {
    IDLE: 'idle',
    MOVE: 'move',
    HIT:  'hit'
};

// Classe do player que é responsavel por todas as funções gerais de movimentação e combate
export class Player {
    static framesIdle = new Image();
    static framesMove = new Image();
    static framesDamage = new Image();
    // Carrega os sprites do player que ficam nos arquvos assets
    static carregarSprites() {
        Player.framesIdle.src = `assets/player/PlayerDefault/PachescoDefaultNew.webp`;
        Player.framesMove.src = `assets/player/PlayerMove/PachescoMove.webp`;
        Player.framesDamage.src = `assets/player/Hit/PachescoHit.webp`;

    }

    static SPRITESHEETS() {
        return {
            [ESTADOS.IDLE]: Player.framesIdle,
            [ESTADOS.MOVE]: Player.framesMove,
            [ESTADOS.HIT]:  Player.framesDamage,
        };
    }
    // Atributos basicos do player 
    constructor() {
        this.x = 0;
        this.y = 0;
        this.size = 32;
        this.sprite = 64;
        this.pontosUpgrade = 0;
        this.estado = ESTADOS.IDLE;

        this.knockbackVX = 0;
        this.knockbackVY = 0;

        this.speed = 1;
        this.hp = 100;
        this.maxHp = 100;
        this.ataque = 10;

        this.level = 1;
        this.xp = 0;
        this.xpProximoLevel = 200; // xp necessário pro próximo level

        this.ultimoDano = 0;
        this.retrato = {x: 10, y: 10,w: 60, h: 60};
        
        // Atributos das animações do player
        this.animacao = {
            frame: 0,
            timer: 0,
            velocidade: 3,
        };

        //Arma inicial do player
        this.weapon = pistol;

        this.keys = {};
        window.addEventListener("keydown", (e) => { this.keys[e.key.toLowerCase()] = true;});
        window.addEventListener("keyup", (e) => {this.keys[e.key.toLowerCase()] = false;});
    }

    spriteBase(){
        return Player.SPRITESHEETS()[ESTADOS.IDLE];
    }
    
    // metodo que realiza o upgrade no player permitindo aumentar seus atributos
    levelUp() {
        this.level++;
        this.xp = this.xp - this.xpProximoLevel;
        this.xpProximoLevel = this.level * 100;
        this.pontosUpgrade += 1;
        abrirUpgrade();
    }

    // metodo para aumentar o xp do player
    ganharXP(qtd) {
        this.xp += qtd;
        if (this.xp >= this.xpProximoLevel) this.levelUp();
    }
    // equipa uma arma diferente
    equipWeapon(weapon) {
    this.weapon = weapon;
    }
    // metodo de verificação de colisão do player
    bateu(x, y) {
    const e = Math.floor((x - this.size / 2) / blocoTamanho);
    const d = Math.floor((x + this.size / 2) / blocoTamanho);
    const c = Math.floor((y - 12 - this.size / 2) / blocoTamanho);
    const b = Math.floor((y + 12 + this.size / 2) / blocoTamanho);

    if (ehSolido(e, c) || ehSolido(d, c) || ehSolido(e, b) || ehSolido(d, b)) return true;

    return colideComObjetosSolidos(x, y, this.size);
}

    updateAnimacao(movendo, dt) {
    this.animacao.timer += dt * 60;

    if (this.animacao.timer >= this.animacao.velocidade) {
        this.animacao.timer = 0;
        this.animacao.frame = (this.animacao.frame + 1) % 9; // 9 frames
    }

    // Atualiza o estado baseado na situação atual
    const piscando = Date.now() - this.ultimoDano < 100;
    if (piscando) this.estado = ESTADOS.HIT;
    else if (movendo) this.estado = ESTADOS.MOVE;
    else this.estado = ESTADOS.IDLE;
}

    // metodo que atualiza a posição do player de acordo com sua movimentação
    update(dt) {
        const vel = this.speed * 200 * dt;

        let dx = 0;
        let dy = 0;

        if (this.keys["w"] || this.keys["arrowup"])    dy--;
        if (this.keys["s"] || this.keys["arrowdown"])  dy++;
        if (this.keys["a"] || this.keys["arrowleft"])  dx--;
        if (this.keys["d"] || this.keys["arrowright"]) dx++;

        const movendo = dx !== 0 || dy !== 0;
        this.updateAnimacao(movendo, dt);

        const len = Math.hypot(dx, dy);
        if (len > 0) { dx /= len; dy /= len; }

        const nx = this.x + dx * vel;
        if (!this.bateu(nx, this.y)) this.x = nx;

        const ny = this.y + dy * vel;
        if (!this.bateu(this.x, ny)) this.y = ny;

        // aplica knockback, se houver
        if (Math.abs(this.knockbackVX) > 0.01 || Math.abs(this.knockbackVY) > 0.01) {
        const kx = this.x + this.knockbackVX;
        const ky = this.y + this.knockbackVY;

        if (!this.bateu(kx, this.y)) this.x = kx;
        if (!this.bateu(this.x, ky)) this.y = ky;

        this.knockbackVX *= 0.85;
        this.knockbackVY *= 0.85;
        }
    }
    // metodo que faz o desenho do player e suas informações na tela
    draw(mouse) {
        const py = ALTURA / 2;
        const px = LARGURA / 2;

        const spritesheet = Player.SPRITESHEETS()[this.estado];

        const colunas = 3;
        const frameW  = 32;
        const frameH  = 32;
        const col = this.animacao.frame % colunas;
        const row = Math.floor(this.animacao.frame / colunas);

        desenharSombra(ctx, px - this.sprite / 2, py - this.sprite / 2, this.sprite, {
            larguraFator: 0.25,
            alturaFator: 0.08,
            offsetY: 0.95
        });

        ctx.save();
        ctx.translate(px, py);
        if (mouse.x < px) ctx.scale(-1, 1);
        ctx.drawImage(spritesheet, col * frameW, row * frameH, frameW, frameH, -this.sprite / 2, -this.sprite / 2, this.sprite, this.sprite);
        ctx.restore();
    }   

    drawHUD() {
        // RETRATO
        ctx.drawImage(retrato, this.retrato.x, this.retrato.y, this.retrato.w, this.retrato.h);
        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(this.retrato.x, this.retrato.y, this.retrato.w, this.retrato.h);

        // HP BAR
        const barraL = 100;
        const barraA = 20;
        const offset = -20;

        ctx.strokeStyle = "white";
        ctx.lineWidth = 2;
        ctx.strokeRect(10 + barraL + offset, 10, this.maxHp + 6, barraA + 6);

        ctx.fillStyle = "white";
        ctx.fillRect(10 + barraL + offset + 3, 13, (this.hp / this.maxHp) * barraL, barraA);

        // XP BAR
        const xpW = 900;
        const xpH = 16;
        const xpX = LARGURA / 2 - xpW / 2;
        const xpY = ALTURA - 30;

        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(xpX, xpY, xpW, xpH);

        ctx.fillStyle = "white";
        ctx.fillRect(xpX, xpY, xpW * (this.xp / this.xpProximoLevel), xpH);

        ctx.strokeStyle = "white";
        ctx.strokeRect(xpX, xpY, xpW, xpH);

        ctx.fillStyle = "white";
        ctx.font = "bold 22px GamerFonte";
        ctx.textAlign = "center";
        ctx.fillText(`LV ${this.level}`, LARGURA / 2, xpY - 5);
        ctx.textAlign = "left";
    }
}

Player.carregarSprites();
export const player = new Player();