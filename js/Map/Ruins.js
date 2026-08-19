// js/Map/Ruins.js

import { player } from "../Models/Player.js";
import { enemies } from "../Models/Enemy.js";
import { Chest } from "./Chest.js";
import { SkeletonFlame } from "../Models/SkeletonFlame.js";
import { WeaponDrop } from "../Props/WeaponDrop.js";
import { props } from "../Props/Prop.js";
import { Room } from "./Room.js";

const ESTADO = {
    ESPERANDO: 0,
    COMBATE: 1,
    CONCLUIDA: 2
};

export class Ruins extends Room {

    static floor = new Image();

    static carregarAssets() {
        Ruins.floor.src = "assets/map/ruinas/stoneFloor2.webp";
    }

    getFloorImage() {
        return Ruins.floor;
    }

    constructor(tileX, tileY) {

        super(tileX, tileY);

        this.estado = ESTADO.ESPERANDO;
        this.enemies = [];

        const chestX = this.x + this.width / 2;
        const chestY = this.y + this.height / 2;

        this.chest = new Chest(chestX, chestY, {
            bloqueado: true,

            onInteragir: () => {

                if (this.estado !== ESTADO.ESPERANDO)
                    return;

                this.estado = ESTADO.COMBATE;

                this.spawnEnemies();
            },

            onAbrir: (weapon) => {

                props.push(
                    new WeaponDrop(
                        this.chest.x,
                        this.chest.y - 15,
                        weapon
                    )
                );

            }
        });
    }

    getSolidObjects() {
        return [this.chest];
    }

    spawnEnemies() {

        const quantidade = 2;

        for (let i = 0; i < quantidade; i++) {

            const angulo = Math.random() * Math.PI * 2;
            const distancia = 400 + Math.random() * 200;

            const x = player.x + Math.cos(angulo) * distancia;
            const y = player.y + Math.sin(angulo) * distancia;

            const e = new SkeletonFlame(x, y);

            enemies.push(e);
            this.enemies.push(e);
        }
    }

    update() {

        this.chest.update();

        if (this.estado !== ESTADO.COMBATE)
            return;

        this.enemies = this.enemies.filter(enemy =>
            enemies.includes(enemy)
        );

        if (this.enemies.length === 0) {
            this.estado = ESTADO.CONCLUIDA;
            this.chest.abrir();
        }
    }

    draw() {
        this.drawFloor();
        this.chest.draw();
    }
}

Ruins.carregarAssets();