import { ctx, canvas, drawMap, LARGURA, ALTURA } from './map.js';
import { player } from './Models/Player.js';
import { updateEnemies, drawEnemies } from './Models/Enemy.js';
import { gun } from './Models/Pistol.js';
import { angulo, mouse } from './Models/Gun.js';
import { updateBullets, drawBullets } from './Models/Bullet.js';
import { spawnEnemy } from './spawner.js';

import {
    state as upgradeState,
    drawUpgrade,
    handleUpgradeClick
} from './upgradeUI.js';

import {
    initUI,
    updateTimer,
    pausarTimer,
    retomarTimer,
    drawTimer,
    drawGameOver,
    drawMenu,
    drawControls,
    mostrandoControles,
    jogoIniciado
} from './ui.js';

/* Serve para suavizar a imagem quando é chamado,  
porem no caso ele acaba dando um bloor na imagem, por isso sera destivado */
ctx.imageSmoothingEnabled = false;


// ─────────────────────────────
// INPUT
// ─────────────────────────────

window.addEventListener("mousedown", (e) => {
    const rect = canvas.getBoundingClientRect();

    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const p = player.retrato;

    // abre upgrade
    if (
        p &&
        mx >= p.x &&
        mx <= p.x + p.w &&
        my >= p.y &&
        my <= p.y + p.h
    ) {
        upgradeState.escolhendoUpgrade = true;
        gun.segurando = false;
        return;
    }

    // clique no upgrade
    if (upgradeState.escolhendoUpgrade) {
        handleUpgradeClick(mx, my);
        gun.segurando = false;
        return;
    }

    // tiro normal
    gun.segurando = true;
});

window.addEventListener("mouseup", () => {
    gun.segurando = false;
});

window.addEventListener("blur", () => {
    gun.segurando = false;
});

window.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {
        upgradeState.escolhendoUpgrade = !upgradeState.escolhendoUpgrade;
        return;
    }

    // reload
    if (e.key.toLowerCase() === "r") {
        gun.recarregar();
    }

});


// ─────────────────────────────
// INIT
// ─────────────────────────────

initUI(spawnEnemy);

let ultimoFrame = 0;


// ─────────────────────────────
// GAME LOOP
// ─────────────────────────────

let estavaParado = false;

function gameLoop(timestamp) {
    const deltaTime = (timestamp - ultimoFrame) / 1000;
    ultimoFrame = timestamp;

    ctx.clearRect(0, 0, LARGURA, ALTURA);

    if (!jogoIniciado) {
        if (mostrandoControles) drawControls();
        else drawMenu();
        requestAnimationFrame(gameLoop);
        return;
    }

    const paused = player.hp <= 0 || upgradeState.escolhendoUpgrade;

    // Só chama pausar/retomar quando o estado muda
    if (paused && !estavaParado) {
        pausarTimer();
        estavaParado = true;
    } else if (!paused && estavaParado) {
        retomarTimer();
        estavaParado = false;
    }

    if (!paused) {
        player.update(deltaTime, mouse);
        updateBullets(deltaTime);
        updateEnemies(deltaTime);
        gun.update(deltaTime, angulo);
        updateTimer(spawnEnemy);
    }


    // ─────────────────────────────
    // DRAW
    // ─────────────────────────────

    drawMap(player.x, player.y);
    drawEnemies();
    drawBullets();

    player.draw(mouse);

    gun.draw();
    gun.drawBarra();

    drawTimer();

    if (player.hp <= 0) {
        drawGameOver();
    }

    drawUpgrade();

    requestAnimationFrame(gameLoop);
}


// ─────────────────────────────
// START
// ─────────────────────────────

document.fonts.ready.then(() => {
    requestAnimationFrame(gameLoop);
});