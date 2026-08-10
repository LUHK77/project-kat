// js/utils/shadow.js

export function desenharSombra(ctx, x, y, spriteSize, {
    larguraFator = 0.48,
    alturaFator = 0.10,
    offsetY = 0.88,
    opacidade = 0.35,
} = {}) {

    ctx.fillStyle = `rgba(0,0,0,${opacidade})`;
    ctx.beginPath();
    ctx.ellipse(
        x + spriteSize / 2,
        y + spriteSize * offsetY,
        spriteSize * larguraFator,
        spriteSize * alturaFator,
        0, 0, Math.PI * 2
    );
    ctx.fill();
}