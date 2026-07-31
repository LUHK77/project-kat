// js/map.js

// Pega o canvas do HTML e o contexto 2D pra desenhar
export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

// Corrige escala em telas de alto DPI (ex: Retina) — sem isso ficaria borrado
const dpr = window.devicePixelRatio || 1;

// Tamanho visual da tela (em pixels CSS)
export const LARGURA = window.innerWidth;
export const ALTURA  = window.innerHeight;

// Define a resolução real do canvas (maior que o visual em telas DPI alto)
canvas.width  = LARGURA * dpr;
canvas.height = ALTURA  * dpr;

// Define o tamanho visual do canvas no CSS
canvas.style.width  = LARGURA + "px";
canvas.style.height = ALTURA  + "px";

// Escala o contexto pra compensar o DPI — tudo desenhado em coordenadas normais
ctx.scale(dpr, dpr);

// Sprites das gramas
const imgSolo = [new Image(), new Image(), new Image()];
imgSolo[0].src = "assets/map/sprite_0.png";
imgSolo[1].src = "assets/map/sprite_1.png";
imgSolo[2].src = "assets/map/sprite_2.png";

// Sprite da pedra
const imgStone = new Image();
imgStone.src = "assets/map/pedra_0.png";

// Tamanho de cada tile em pixels
export const blocoTamanho = 64;

// Quantos tiles formam um chunk — usado pra espalhar pedras de forma agrupada
const chunkSize = 10;

/**
 * Retorna o tipo de tile ("grass" ou "stone") pra qualquer posição do mundo.
 * O mapa é infinito — nenhum array é armazenado, tudo é calculado sob demanda.
 * 
 * - Área 5x5 ao redor do spawn (0,0) sempre retorna grama — spawn seguro.
 * - Fora disso, calcula em qual chunk o tile está e gera uma seed pra ele.
 * - A seed determina se o chunk tem pedra (50% dos chunks) e onde ela fica.
 * - Mesma posição sempre retorna o mesmo tile — mapa determinístico.
 */
export function geraBloco(tileX, tileY) {
    // Área segura ao redor do spawn
    if (Math.abs(tileX) <= 2 && Math.abs(tileY) <= 2) return "grass";

    // Descobre em qual chunk esse tile está
    const chunkX = Math.floor(tileX / chunkSize);
    const chunkY = Math.floor(tileY / chunkSize);

    // Seed única por chunk baseada na posição dele
    const seed = Math.abs(chunkX * 37 + chunkY * 71);

    // Só metade dos chunks terão pedra
    if (seed % 2 !== 0) return "grass";

    // Posição da pedra dentro do chunk (determinística pela seed)
    const pedraX = seed % chunkSize;
    const pedraY = Math.floor(seed / chunkSize) % chunkSize;

    // Posição local do tile dentro do chunk
    const localX = ((tileX % chunkSize) + chunkSize) % chunkSize;
    const localY = ((tileY % chunkSize) + chunkSize) % chunkSize;

    if (localX === pedraX && localY === pedraY) return "stone";
    return "grass";
}

/**
 * Retorna true se o tile na posição (tileX, tileY) bloqueia movimento.
 * Usado pela colisão do player e dos inimigos.
 */
export function ehSolido(tileX, tileY) {
    return geraBloco(tileX, tileY) === "stone";
}

/**
 * Desenha apenas os tiles visíveis na tela a cada frame.
 * A câmera é centralizada no player — calcula quais tiles aparecem
 * na tela e desenha só eles, ignorando o resto do mundo.
 */
export function drawMap(playerX, playerY) {
    // Posição do canto superior esquerdo da câmera no mundo
    const camX = playerX - LARGURA / 2;
    const camY = playerY - ALTURA  / 2;

    // Índices dos tiles visíveis na tela
    const firstTileX = Math.floor(camX / blocoTamanho);
    const firstTileY = Math.floor(camY / blocoTamanho);
    const lastTileX  = firstTileX + Math.ceil(LARGURA / blocoTamanho) + 1;
    const lastTileY  = firstTileY + Math.ceil(ALTURA  / blocoTamanho) + 1;

    for (let y = firstTileY; y <= lastTileY; y++) {
        for (let x = firstTileX; x <= lastTileX; x++) {
            // Posição do tile na tela em pixels
            const screenX = x * blocoTamanho - camX;
            const screenY = y * blocoTamanho - camY;
            const tile = geraBloco(x, y);

            if (tile === "grass") {
                // Variação aleatória de sprite baseada na posição — sempre a mesma pra mesma posição
                const variacao = Math.abs((x * 374761393 + y * 668265263) >>> 0) % 3;
                ctx.drawImage(imgSolo[variacao], screenX, screenY, blocoTamanho, blocoTamanho);
            } else {
                ctx.drawImage(imgStone, screenX, screenY, blocoTamanho, blocoTamanho);
            }
        }
    }
}