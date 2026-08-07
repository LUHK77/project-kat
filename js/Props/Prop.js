// js/Props/Prop.js

import { player } from "../Models/Player.js";

export class Prop {

    constructor(x, y, size = 32) {
        this.x = x;
        this.y = y;

        this.spriteSize = size;
        this.hitboxSize = size;

        this.removido = false;

    }

    isTouchingPlayer() {
        return Math.hypot(
            player.x - this.x,
            player.y - this.y
        ) < this.hitboxSize;
    }

    update() {
        if (this.isTouchingPlayer()) {
            this.onPickup();
            this.removido = true;
        }
    }

    onPickup() {
        // Cada prop implementa o seu
    }

    draw() {
        // Cada prop implementa o seu
    }
}


export const props = [];

export function updateProps(deltaTime) {
    for (let i = props.length - 1; i >= 0; i--) {

        props[i].update(deltaTime);

        if (props[i].removido) {
            props.splice(i, 1);
        }
    }
}

export function drawProps() {
    for (const prop of props) {
        prop.draw();
    }
}