// js/utils/hash.js
//
// Hash determinístico 2D usado em qualquer lugar do jogo que precise de
// "aleatoriedade" repetível baseada em posição (x, y): variação de sprite
// do chão, geração de pedras no mapa infinito, padrão de estruturas, etc.
//
// - Mesma (x, y, seed) sempre retorna o mesmo valor (por isso o mapa não
//   "pisca" nem muda toda vez que redesenha).
// - O parâmetro `seed` é opcional: use 0 (padrão) pra coisas globais do
//   mundo (ex: map.js), e uma seed própria por instância pra estruturas
//   que devem variar entre si (cada Ruins, cada sala futura, etc).
export function hash2D(x, y, seed = 0) {
    let h = (x * 374761393 + y * 668265263 + seed * 2654435761) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    h = (h ^ (h >>> 16)) >>> 0;
    return h;
}

// Gera uma seed "de instância". Chame isso UMA VEZ, ao criar a estrutura
// (ex: no constructor de uma Room) — nunca dentro de draw()/update(), ou
// o padrão fica re-randomizando a cada frame.
export function novaSeed() {
    return Math.floor(Math.random() * 1000000) >>> 0;
}