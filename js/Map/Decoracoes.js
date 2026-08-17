// js/Map/Decoracoes.js
//
// Detalhes soltos, sem colisão, espalhados pelo mapa: campo de flores,
// grama alta, ossos. Cada sprite já é um "carimbo" pronto (o blob
// inteiro já vem desenhado na spritesheet), então o posicionamento é
// esparso — uma âncora por chunk, no máximo.
//
// IMPORTANTE (performance): a varredura é por CHUNK, não por tile.
// Cada chunk só pode ter 1 âncora de cada tipo, então não faz sentido
// testar tile a tile (isso que causava o lag na versão anterior —
// ~1800 checagens/frame numa tela comum, além de um cache com chave
// de string que crescia pra sempre). Varrendo por chunk, o número de
// iterações cai pra dezenas por frame, e nem precisa de cache: o
// hash2D já é barato o suficiente pra recalcular direto.

import { hash2D } from "../utils/hash.js";

// Tamanho de referência de 1 tile no mundo (bate com TILE do PatchLayer
// e com FLOOR_FRAME_SIZE do chão). blocoTamanho (passado nas funções)
// é o tamanho final em pixels na tela — a razão entre os dois é a escala.
const TILE_MUNDO = 32;

const imgOssos = new Image();
const imgFlores = new Image();
const imgGramaAlta = new Image();

imgOssos.src = "assets/map/detalhamento/details.webp"; 
imgFlores.src = "assets/map/detalhamento/camposFlores.webp"; 
imgGramaAlta.src = "assets/map/detalhamento/gramaAlta.webp";

// ============================================================
// CONFIGURAÇÃO DE CADA TIPO
// ============================================================
//
// spritesheet   → Image() com as variantes empilhadas em 1 coluna
// numFrames     → quantas variantes existem
// frameSize     → tamanho (px) de cada frame na spritesheet, em
//                 "pixels de mundo" (32 = 1 tile, 64 = 2x2 tiles)
// chunkSize     → tamanho (em tiles) da região usada pra sortear
//                 se esse tipo aparece ali — quanto maior, mais raro
// chancePorMil  → chance (0-1000) de UM chunk conter esse tipo
// seedOffset    → separa o sorteio desse tipo dos outros (senão todos
//                 os tipos cairiam sempre nos mesmos chunks/posições)
// ============================================================

const DECORACOES = [
    {
        nome: "flores",
        spritesheet: imgFlores,
        numFrames: 3,
        frameSize: 128,
        tamanhoTiles: 5,
        chunkSize: 10,
        chancePorMil: 10,
        seedOffset: 7101
    },
    {
        nome: "gramaAlta",
        spritesheet: imgGramaAlta,
        numFrames: 3,
        frameSize: 128,
        tamanhoTiles: 5,
        chunkSize: 10,
        chancePorMil: 200,
        seedOffset: 7201
    },
    {
        nome: "ossos",
        spritesheet: imgOssos,
        numFrames: 6,
        frameSize: 32,
        tamanhoTiles: 1,
        chunkSize: 6,
        chancePorMil: 300,
        seedOffset: 7001
    }
];
 
 
// ============================================================
// SORTEIA A ÂNCORA DE UM CHUNK PRA UM TIPO (sem cache — é barato)
// ============================================================
//
// Retorna null se esse chunk não tem instância desse tipo, ou
// { tileX, tileY, frame } com a posição exata e a variante sorteada.
// ============================================================
 
function ancoraDoChunk(chunkX, chunkY, seed, config) {
 
    const s = hash2D(chunkX, chunkY, seed + config.seedOffset);
 
    if (s % 1000 >= config.chancePorMil) {
        return null;
    }
 
    const localX = s % config.chunkSize;
    const localY = Math.floor(s / config.chunkSize) % config.chunkSize;
    const frame  = Math.floor(s / (config.chunkSize * config.chunkSize)) % config.numFrames;
 
    return {
        tileX: chunkX * config.chunkSize + localX,
        tileY: chunkY * config.chunkSize + localY,
        frame
    };
}
 
 
// ============================================================
// DESENHA TODAS AS DECORAÇÕES VISÍVEIS NA TELA
// ============================================================
//
// Chame isso 1x por frame (igual drawStones), depois de desenhar o
// chão. Varre só os CHUNKS que tocam a área visível (com uma margem
// de tiles, já que sprites de 64px cobrem 2x2 e podem "vazar" pra
// dentro da tela vindos de uma âncora um pouco fora dela).
// ============================================================
 
export function drawDecoracoes(
    ctx,
    playerX,
    playerY,
    seed,
    LARGURA,
    ALTURA,
    blocoTamanho
) {
 
    const camX = playerX - LARGURA / 2;
    const camY = playerY - ALTURA  / 2;
 
    // tiles extras pra cobrir sprites maiores que 1 tile — usa o maior
    // tamanhoTiles configurado, senão um sprite grande poderia "sumir"
    // um pouco antes da borda da tela.
    const margem = Math.max(...DECORACOES.map(d => d.tamanhoTiles));
 
    const firstTileX = Math.floor(camX / blocoTamanho) - margem;
    const firstTileY = Math.floor(camY / blocoTamanho) - margem;
    const lastTileX  = firstTileX + Math.ceil(LARGURA / blocoTamanho) + margem * 2;
    const lastTileY  = firstTileY + Math.ceil(ALTURA  / blocoTamanho) + margem * 2;
 
    for (const config of DECORACOES) {
 
        const firstChunkX = Math.floor(firstTileX / config.chunkSize);
        const firstChunkY = Math.floor(firstTileY / config.chunkSize);
        const lastChunkX  = Math.floor(lastTileX  / config.chunkSize);
        const lastChunkY  = Math.floor(lastTileY  / config.chunkSize);
 
        for (let cy = firstChunkY; cy <= lastChunkY; cy++) {
            for (let cx = firstChunkX; cx <= lastChunkX; cx++) {
 
                const ancora = ancoraDoChunk(cx, cy, seed, config);
 
                if (!ancora) continue;
 
                // A âncora pode cair fora da faixa de tiles visível
                // mesmo o chunk tocando a tela — pula nesse caso.
                if (
                    ancora.tileX < firstTileX || ancora.tileX > lastTileX ||
                    ancora.tileY < firstTileY || ancora.tileY > lastTileY
                ) continue;
 
                const screenX = Math.round(ancora.tileX * blocoTamanho - camX);
                const screenY = Math.round(ancora.tileY * blocoTamanho - camY);
 
                const tamanhoDesenho = config.tamanhoTiles * blocoTamanho;
 
                ctx.drawImage(
                    config.spritesheet,
 
                    0,
                    ancora.frame * config.frameSize,
                    config.frameSize,
                    config.frameSize,
 
                    screenX,
                    screenY,
                    tamanhoDesenho,
                    tamanhoDesenho
                );
            }
        }
    }
}
 




