// js/Map/Decoracoes.js
//
// Detalhes soltos, sem colisão, espalhados pelo mapa: campo de flores,
// grama alta, ossos.

import { hash2D } from "../utils/hash.js";

const imgOssos = new Image();
const imgFlores = new Image();
const imgGramaAlta = new Image();

imgOssos.src = "assets/map/detalhamento/details.webp";
imgFlores.src = "assets/map/detalhamento/camposFlores.webp";
imgGramaAlta.src = "assets/map/detalhamento/gramaAlta.webp";

// ============================================================
// VERSÃO ESPELHADA PRÉ-RENDERIZADA DA GRAMA ALTA
// ============================================================
//
// Antes: cada tufo espelhado custava save()+translate()+scale()+
// drawImage()+restore() — 5 operações de canvas por tufo, multiplicado
// por vários tufos sobrepostos em cada moita, todo frame.
//
// Agora: espelha a spritesheet inteira UMA VEZ (quando a imagem
// termina de carregar) e guarda num canvas offscreen. No draw, só
// escolhe "normal" ou "espelhada" e chama drawImage direto.
// ============================================================

let imgGramaAltaEspelhada = null;

imgGramaAlta.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = imgGramaAlta.width;
    canvas.height = imgGramaAlta.height;

    const c = canvas.getContext("2d");
    c.translate(canvas.width, 0);
    c.scale(-1, 1);
    c.drawImage(imgGramaAlta, 0, 0);

    imgGramaAltaEspelhada = canvas;
};

// ============================================================
// CONFIGURAÇÃO DE CADA TIPO
// ============================================================
//
// PERFORMANCE: chunkSize pequeno + chancePorMil alto = MUITOS
// drawImage por frame. O profiling mostrou "ossos" (chunkSize=6,
// chancePorMil=300) como o maior gargalo do jogo — maior até que a
// grama alta. Ajustado abaixo.
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
        nome: "ossos",
        spritesheet: imgOssos,
        numFrames: 8,
        frameSize: 32,
        tamanhoTiles: 1,
        chunkSize: 10,       // era 6
        chancePorMil: 100,   // era 300
        seedOffset: 7001
    }
];


// ============================================================
// SORTEIA A ÂNCORA DE UM CHUNK PRA UM TIPO (sem cache — é barato)
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
// DESENHA TODAS AS DECORAÇÕES (flores, ossos) VISÍVEIS NA TELA
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