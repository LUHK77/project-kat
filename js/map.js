// js/map.js
import { Stone } from './Map/Stone.js';
import { Tree } from './Map/Tree.js';
import { hash2D, novaSeed } from './utils/hash.js';
// Pega o canvas do HTML e o contexto 2D pra desenhar
export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");

// Corrige escala em telas de alto DPI (ex: Retina) — sem isso ficaria borrado
const dpr = window.devicePixelRatio || 1;

// Seed do mundo: gerada uma vez quando o jogo carrega. É isso que faz o
// mapa mudar entre uma sessão e outra — sem ela, geraBloco() sempre monta
// o mesmo mapa (mesmas pedras, sempre nos mesmos lugares).
const mapSeed = novaSeed();

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
const imgFloor = new Image();
imgFloor.src = "assets/map/soloFloor4.webp";

const FLOOR_FRAME_SIZE = 32;
const FLOOR_FRAME_COLS = 2;



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
    const seed =  hash2D(chunkX, chunkY, mapSeed);

    // Só metade dos chunks terão pedra
    if (seed % 2 !== 0) return "grass";

    // Posição da pedra dentro do chunk (determinística pela seed)
    const objectX = seed % chunkSize;
    const objectY = Math.floor(seed / chunkSize) % chunkSize;

    // Posição local do tile dentro do chunk
    const localX = ((tileX % chunkSize) + chunkSize) % chunkSize;
    const localY = ((tileY % chunkSize) + chunkSize) % chunkSize;

    if (localX === objectX && localY === objectY) return "object";
    return "grass";
}

// Áreas de salas especiais (ver Map/Room.js) que sobrescrevem a colisão
// do terreno procedural — dentro delas o chão é controlado pela própria sala.
const areasEspeciais = [];

export function registrarAreaEspecial(tileX, tileY, widthTiles, heightTiles, room) {
    areasEspeciais.push({ tileX, tileY, widthTiles, heightTiles, room});
}

function makeObject(tileX, tileY) {
    const seed = hash2D(tileX, tileY);
    return (seed % 100 < 80)
        ? new Stone(tileX, tileY)
        : new Tree(tileX, tileY);
}

export function drawStones(playerX, playerY) {

    const camX = playerX - LARGURA / 2;
    const camY = playerY - ALTURA  / 2;

    const firstTileX = Math.floor(camX / blocoTamanho);
    const firstTileY = Math.floor(camY / blocoTamanho);
    const lastTileX  = firstTileX + Math.ceil(LARGURA / blocoTamanho) + 1;
    const lastTileY  = firstTileY + Math.ceil(ALTURA  / blocoTamanho) + 1;

    for (let y = firstTileY; y <= lastTileY; y++) {
        for (let x = firstTileX; x <= lastTileX; x++) {
            if (geraBloco(x, y) === "object") {
                makeObject(x, y).draw();
            }
        }
    }
}

/**
 * Retorna true se o tile na posição (tileX, tileY) bloqueia movimento.
 * Usado pela colisão do player e dos inimigos.
 */

export function ehSolido(tileX, tileY) {

    for (const area of areasEspeciais) {
        if (
            tileX >= area.tileX && tileX < area.tileX + area.widthTiles &&
            tileY >= area.tileY && tileY < area.tileY + area.heightTiles
        ) {
            return false;
        }
    }
    return false;
}

// nova função — colisão real (pixel a pixel) contra objetos sólidos das salas
export function colideComObjetosSolidos(x, y, size) {

    const left   = x - size / 2;
    const right  = x + size / 2;
    const top    = y - 12 - size / 2;
    const bottom = y + 12 + size / 2;

    function colideComHitbox(hb) {
        return !(
            right  <= hb.x ||
            left   >= hb.x + hb.width ||
            bottom <= hb.y ||
            top    >= hb.y + hb.height
        );
    }

    // objetos sólidos das salas (baú, etc.)
    for (const area of areasEspeciais) {
        for (const obj of area.room.getSolidObjects()) {
            if (colideComHitbox(obj.getHitbox())) return true;
        }
    }

    // pedras do mundo infinito, só nas vizinhanças de (x, y)
    const tileX = Math.floor(x / blocoTamanho);
    const tileY = Math.floor(y / blocoTamanho);

    for (let ty = tileY - 1; ty <= tileY + 1; ty++) {
        for (let tx = tileX - 1; tx <= tileX + 1; tx++) {

            if (geraBloco(tx, ty) !== "object") continue;

            if (colideComHitbox(makeObject(tx, ty).getHitbox())) return true;
        }
    }

    return false;
}

/**
 * Desenha apenas os tiles visíveis na tela a cada frame.
 * A câmera é centralizada no player — calcula quais tiles aparecem
 * na tela e desenha só eles, ignorando o resto do mundo.
 */
export function drawMap(playerX, playerY) {

    const camX = playerX - LARGURA / 2;
    const camY = playerY - ALTURA  / 2;

    const firstTileX = Math.floor(camX / blocoTamanho);
    const firstTileY = Math.floor(camY / blocoTamanho);
    const lastTileX  = firstTileX + Math.ceil(LARGURA / blocoTamanho) + 1;
    const lastTileY  = firstTileY + Math.ceil(ALTURA  / blocoTamanho) + 1;

    for (let y = firstTileY; y <= lastTileY; y++) {
        for (let x = firstTileX; x <= lastTileX; x++) {

            const screenX = x * blocoTamanho - camX;
            const screenY = y * blocoTamanho - camY;
            const tile = geraBloco(x, y);

            if (tile === "grass") {

                const variacao = hash2D(x, y) % 4;
                const col = variacao % FLOOR_FRAME_COLS;
                const row = Math.floor(variacao / FLOOR_FRAME_COLS);

                ctx.drawImage(
                    imgFloor,
                    col * FLOOR_FRAME_SIZE,
                    row * FLOOR_FRAME_SIZE,
                    FLOOR_FRAME_SIZE,
                    FLOOR_FRAME_SIZE,
                    screenX, screenY,
                    blocoTamanho * 1.1, blocoTamanho * 1.1
                );
            }
            // "object" (pedra/árvore) não desenha aqui — já é o drawStones()
        }
    }
}