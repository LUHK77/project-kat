import { ctx, LARGURA, ALTURA } from './map.js';
import { player } from './Models/Player.js';

// estado do menu
export const state = {
    escolhendoUpgrade: false
};

// abre menu
export function abrirUpgrade() {
    state.escolhendoUpgrade = true;
}

// Botões de upgrade
const botoes = [
    { 
        label: "ATK", 
        descricao: () => player.ataque,
        aplicar: () => { player.ataque += 2; }
    },
    { 
        label: "Vel", 
        descricao: () => Math.round(player.speed * 10),
        aplicar: () => { player.speed += 0.1; }
    },
    { 
        label: "HP",  
        descricao: () => player.maxHp / 10,
        aplicar: () => { player.hp += 10; player.maxHp += 10; }
    },
];

export function drawUpgrade() {
    if (!state.escolhendoUpgrade) return;

    // fundo escuro
    ctx.fillStyle = "rgba(0,0,0,0.75)";
    ctx.fillRect(0, 0, LARGURA, ALTURA);

    // painel
    const painelW = 500;
    const painelH = 300;
    const painelX = LARGURA / 2 - painelW / 2;
    const painelY = ALTURA / 2 - painelH / 2;

    ctx.fillStyle = "#111";
    ctx.fillRect(painelX, painelY, painelW, painelH);

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(painelX, painelY, painelW, painelH);

    // botão fechar (X)
    const size = 28;
    const closeX = painelX + painelW - size - 10;
    const closeY = painelY + 10;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(closeX, closeY, size, size);

    ctx.fillStyle = "white";
    ctx.font = "bold 18px GamerFonte";
    ctx.textAlign = "center";
    ctx.fillText("X", closeX + size / 2, closeY + 20);

    state._closeX = closeX;
    state._closeY = closeY;
    state._closeSize = size;

    // pontos
    ctx.fillStyle = "white";
    ctx.font = "16px GamerFonte";
    ctx.textAlign = "center";
    ctx.fillText(
        `Pontos: ${player.pontosUpgrade}`,
        painelX + painelW / 2,
        painelY + 25
    );

    // sprite
    const spriteSize = 120;
    ctx.drawImage(
        player.spriteBase(),
        32,
        0,
        32,
        32,
        painelX + 40,
        painelY + painelH / 2 - spriteSize / 2,
        spriteSize,
        spriteSize
    );

    // stats box
    const statsX = painelX + 200;
    const statsW = 260;
    const statsH = 220;
    const statsY = painelY + painelH / 2 - statsH / 2;

    ctx.strokeStyle = "white";
    ctx.lineWidth = 1;
    ctx.strokeRect(statsX, statsY, statsW, statsH);

    ctx.fillStyle = "white";
    ctx.font = "bold 18px GamerFonte";
    ctx.textAlign = "center";
    ctx.fillText("Stats", statsX + statsW / 2, statsY + 24);

    const lineH = 50;

    botoes.forEach((b, i) => {
        const y = statsY + 50 + i * lineH;

        // label
        ctx.fillStyle = "white";
        ctx.font = "16px GamerFonte";
        ctx.textAlign = "right";
        ctx.fillText(b.label + ":", statsX + 40, y + 18);

        // valor
        const boxX = statsX + 50;
        const boxW = 150;

        ctx.strokeRect(boxX, y, boxW, 26);

        ctx.textAlign = "center";
        ctx.fillText(b.descricao(), boxX + boxW / 2, y + 18);

        // botão +
        const btnX = boxX + boxW + 8;
        const btnSize = 26;

        ctx.strokeRect(btnX, y, btnSize, btnSize);
        ctx.fillText("+", btnX + btnSize / 2, y + 19);

        // salva clique
        b._x = btnX;
        b._y = y;
        b._size = btnSize;
    });

    ctx.textAlign = "left";
}

export function handleUpgradeClick(mx, my) {
    if (!state.escolhendoUpgrade) return;

    // fechar menu
    if (
        mx >= state._closeX &&
        mx <= state._closeX + state._closeSize &&
        my >= state._closeY &&
        my <= state._closeY + state._closeSize
    ) {
        state.escolhendoUpgrade = false;
        return;
    }

    // upgrades
    for (const b of botoes) {
        if (
            mx >= b._x &&
            mx <= b._x + b._size &&
            my >= b._y &&
            my <= b._y + b._size
        ) {
            // só compra se tiver pontos disponíveis
            if (player.pontosUpgrade > 0) {
                b.aplicar();
                player.pontosUpgrade--;
            }

            return;
        }
    }
}