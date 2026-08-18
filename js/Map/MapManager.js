// js/Map/MapManager.js

import { Ruins } from "./Ruins.js";
import { player } from "../Models/Player.js";
import { blocoTamanho } from "../map.js";
import { hash2D } from "../utils/hash.js";

const ruinChunkSize = 60;      // tiles por super-chunk (bem maior que o das pedras)
const probabilidade = 8;      // 1 em 20 chunks tem ruína (~5%)
const seedRuinas = 987654321;  // seed fixa só pras ruínas, separada da seed do mundo

const rooms = [];
const chunksGerados = new Map(); // cache: "chunkX,chunkY" -> true (evita regenerar)

function tentarGerarRuina(chunkX, chunkY) {

    const key = `${chunkX},${chunkY}`;
    if (chunksGerados.has(key)) return;
    chunksGerados.set(key, true);

    const seed = hash2D(chunkX, chunkY, seedRuinas); // 1º: declara


    if (seed % probabilidade !== 0) return;


    const margem = 10;
    const areaUtil = ruinChunkSize - margem * 2;

    const localX = margem + (seed % areaUtil);
    const localY = margem + (Math.floor(seed / areaUtil) % areaUtil);

    const tileX = chunkX * ruinChunkSize + localX;
    const tileY = chunkY * ruinChunkSize + localY;

    

    rooms.push(new Ruins(tileX, tileY, seed));
}

function atualizarChunksProximos() {

    const chunkAtualX = Math.floor(player.x / blocoTamanho / ruinChunkSize);
    const chunkAtualY = Math.floor(player.y / blocoTamanho / ruinChunkSize);

    const raio = 1; // checa o chunk atual + os 8 vizinhos

    for (let cy = chunkAtualY - raio; cy <= chunkAtualY + raio; cy++) {
        for (let cx = chunkAtualX - raio; cx <= chunkAtualX + raio; cx++) {
            tentarGerarRuina(cx, cy);
        }
    }
}

const raioAtivo = ruinChunkSize * blocoTamanho * 2; // ajuste ao gosto

function estaProxima(room) {
    const dx = room.x - player.x;
    const dy = room.y - player.y;
    return Math.hypot(dx, dy) < raioAtivo;
}

export function updateMap() {
    atualizarChunksProximos();

    for (let i = rooms.length - 1; i >= 0; i--) {
        const room = rooms[i];
        if (room.estado === 2 /* CONCLUIDA */ && !estaProxima(room, raioAtivo * 3)) {
            rooms.splice(i, 1); // remove de vez; chunksGerados mantém o registro pra não regenerar
        } else if (estaProxima(room)) {
            room.update();
        }
    }
}

export function drawMapObjects() {
    for (const room of rooms) {
        if (estaProxima(room)) {
            room.draw();
        }
    }
}