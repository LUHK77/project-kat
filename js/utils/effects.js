// js/utils/vignette.js
import { ctx, LARGURA, ALTURA } from '../map.js';
import { player } from '../Models/Player.js';

export function drawVignette() {
    const centroX = LARGURA / 2;
    const centroY = ALTURA / 2;

    const tempoDesdeDano = Date.now() - player.ultimoDano; // você já tem esse campo
    const duracaoEfeito = 300; // ms que o "aperto" dura

    let apertoDano = 0;
    if (tempoDesdeDano < duracaoEfeito) {
        const progresso = tempoDesdeDano / duracaoEfeito;
        apertoDano = (1 - progresso) * 60; // começa forte (60px a menos) e some
    }

    const raioInterno = Math.min(LARGURA, ALTURA) * 0.25 - apertoDano;
    const raioExterno = Math.max(LARGURA, ALTURA) * 0.75;

    const gradient = ctx.createRadialGradient(
        centroX, centroY, raioInterno,
        centroX, centroY, raioExterno
    );

    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0.85)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LARGURA, ALTURA);
}

export function drawLowHpWarning() {
    const hpPercent = player.hp / player.maxHp;
    if (hpPercent >= 1/3) return; // só desenha se HP baixo

    const pulso = (Math.sin(Date.now() / 200) + 1) / 2; // 0 a 1, pulsando rápido
    const intensidade = (1 - hpPercent / (1/3)) * 0.5; // mais forte quanto mais perto de 0

    const gradient = ctx.createRadialGradient(
        LARGURA / 2, ALTURA / 2, Math.min(LARGURA, ALTURA) * 0.3,
        LARGURA / 2, ALTURA / 2, Math.max(LARGURA, ALTURA) * 0.7
    );

    gradient.addColorStop(0, "rgba(197, 51, 51, 0)");
    gradient.addColorStop(1, `rgba(197, 51, 51, ${intensidade * pulso})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, LARGURA, ALTURA);
}