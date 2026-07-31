import { ctx, canvas, LARGURA, ALTURA } from './map.js';
import { player } from './Models/Player.js';
import { enemies } from './Models/Enemy.js';
import { gun } from './Models/Pistol.js';

const W = LARGURA, H = ALTURA;

export let jogoIniciado = false;
export let mostrandoControles = false;
export let taxaSpawn = 3000;
export let intervalSpawn = null;

let tMorte = 0;
let tInicio = Date.now();
let tJogo = 0;

const img = {
    menu: new Image(),
    over: new Image()
};

img.menu.src = "assets/menu-bg.png";
img.over.src = "assets/gameover-bg.png";

const BTN = {
    menu: { w: 280, h: 70, text: "INICIAR JOGO", color: "#2d4e7c" },
    controles: { w: 280, h: 70, text: "CONTROLES", color: "#2d4e7c" },
    over: { w: 260, h: 60, text: "TENTAR NOVAMENTE", color: "#7c2a21" }
};

// ── HELPERS ─────────────────────────────

const drawBg = (image) => {
    ctx.drawImage(image, 0, 0, W, H);
};

const rect = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
};

const text = (t, x, y, size = 28, color = "#fff") => {
    ctx.fillStyle = color;
    ctx.font = `bold ${size}px GamerFonte`;
    ctx.textAlign = "center";
    ctx.fillText(t, x, y);
};

const btn = (b, x, y) => {
    rect(x, y, b.w, b.h, b.color);
    text(b.text, x + b.w / 2, y + b.h / 2 + 10);
};

const hit = (mx, my, x, y, w, h) =>
    mx >= x && mx <= x + w && my >= y && my <= y + h;

const tempo = () => {
    const m = String(Math.floor(tJogo / 60)).padStart(2, "0");
    const s = String(tJogo % 60).padStart(2, "0");
    return `${m}:${s}`;
};

// ── TIMER ─────────────────────────────

export function updateTimer(spawnEnemy) {
    if (!jogoIniciado || player.hp <= 0) return;

    tJogo = Math.floor((Date.now() - tInicio) / 1000);

    const n = Math.max(500, 1500 - Math.floor(tJogo / 60) * 3000);

    if (n !== taxaSpawn) {
        taxaSpawn = n;

        clearInterval(intervalSpawn);
        intervalSpawn = setInterval(spawnEnemy, n);
    }
}

export const drawTimer = () =>
    jogoIniciado && player.hp > 0 &&
    text(tempo(), W / 2, 40, 32);

// ── MENU ─────────────────────────────

export function drawMenu() {
    drawBg(img.menu);
    rect(0, 0, W, H, "rgba(0,0,0,.55)");

    text("Zombie Survivors", W / 2, H / 2 - 140, 90);
    text("Sobreviva o apocalipse", W / 2, H / 2 - 80, 28, "rgba(255,255,255,.85)");

    btn(BTN.menu, W / 2 - BTN.menu.w / 2, H / 2);
    btn(BTN.controles, W / 2 - BTN.controles.w / 2, H / 2 + 100);
}

export function drawControls() {
    drawBg(img.menu);
    rect(0, 0, W, H, "rgba(0,0,0,.75)");

    text("CONTROLES", W / 2, 120, 60);

    text("WASD - Movimentar", W / 2, 220, 32);
    text("Mouse - Mirar", W / 2, 280, 32);
    text("Clique Esquerdo - Atirar", W / 2, 340, 32);
    text("R - Recarregar", W / 2, 400, 32);
    text("ESC - Pausar e upgrades", W / 2, 460, 32);

    btn(
        { w: 220, h: 60, text: "VOLTAR", color: "#2d4e7c" },
        W / 2 - 110,
        H - 140
    );
}

// ── GAME OVER ─────────────────────────

export function drawGameOver() {
    tMorte++;

    drawBg(img.over);
    rect(0, 0, W, H, "rgba(0,0,0,.65)");

    const x = W / 2, y = H / 2;

    for (let i = 4; i >= 1; i--) {
        text(
            "VOCE MORREU",
            x + Math.sin((tMorte - i * 3) * 0.3) * 6,
            y - 80 + Math.cos((tMorte - i * 3) * 0.2) * 4,
            64,
            `rgba(255,0,0,${i * 0.06})`
        );
    }

    text("VOCE MORREU", x, y - 80, 64);
    text(`Voce sobreviveu por ${tempo()}`, x, y - 20, 24, "rgba(255,255,255,.85)");

    btn(BTN.over, x - BTN.over.w / 2, y + 20);
}

// ── RESTO ─────────────────────────────

export function iniciarJogo(spawnEnemy) {
    jogoIniciado = true;
    tInicio = Date.now();
    tJogo = 0;

    spawnEnemy();
    clearInterval(intervalSpawn);
    intervalSpawn = setInterval(spawnEnemy, taxaSpawn);
}

export function reiniciarJogo(spawnEnemy) {
    tMorte = 0;
    tInicio = Date.now();
    tJogo = 0;
    player.level = 1;
    taxaSpawn = 2500;

    Object.assign(player, { x: 0, y: 0, hp: 100, ultimoDano: 0 , ataque: 10, maxHp: 100, speed: 1, level: 1, xp: 0, xpProximoLevel: 100,});
    enemies.length = 0;

    Object.assign(gun, {
        balas: gun.maxBalas,
        recarregando: false,
        atirando: false,
        ultimoTiro: 0
    });

    clearInterval(intervalSpawn);
    intervalSpawn = setInterval(spawnEnemy, taxaSpawn);
}

export function initUI(spawnEnemy) {
    canvas.addEventListener("click", e => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;

        if (!jogoIniciado) {

        if (mostrandoControles) {
            const bx = W / 2 - 110;
            const by = H - 140;

            if (hit(x, y, bx, by, 220, 60)) {
                mostrandoControles = false;
            }

            return;
        }

        const startX = W / 2 - BTN.menu.w / 2;
        const startY = H / 2;

        const ctrlX = W / 2 - BTN.controles.w / 2;
        const ctrlY = H / 2 + 100;

        if (hit(x, y, startX, startY, BTN.menu.w, BTN.menu.h)) {
            iniciarJogo(spawnEnemy);
            e.stopPropagation();
            return;
        }

        if (hit(x, y, ctrlX, ctrlY, BTN.controles.w, BTN.controles.h)) {
            mostrandoControles = true;
            return;
        }

        return;
        }

        if (player.hp <= 0) {
            const bx = W / 2 - BTN.over.w / 2;
            const by = H / 2 + 20;

            if (hit(x, y, bx, by, BTN.over.w, BTN.over.h)) {
                reiniciarJogo(spawnEnemy);
                e.stopPropagation();
            }
        }
    });
}
