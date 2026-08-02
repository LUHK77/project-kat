// js/gameState.js

// Estados possíveis do jogo
export const ESTADOS_JOGO = {
    MENU:       'menu',
    JOGANDO:    'jogando',
    PAUSADO:    'pausado',
    SALA:       'sala',      // player dentro de sala especial
    GAME_OVER:  'game_over'
};

export let estadoAtual = ESTADOS_JOGO.MENU;

export function setEstado(novo) {
    estadoAtual = novo;
}

export function estaJogando() {
    return estadoAtual === ESTADOS_JOGO.JOGANDO;
}

export function estaNaSala() {
    return estadoAtual === ESTADOS_JOGO.SALA;
}

export function estaPausado() {
    return estadoAtual === ESTADOS_JOGO.PAUSADO;
}