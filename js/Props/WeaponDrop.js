// js/Props/WeaponDrop.js
import { ctx, LARGURA, ALTURA } from "../map.js";
import { player } from "../Models/Player.js";

export class WeaponDrop {

    constructor(x, y, weapon) {

        this.x = x;
        this.y = y;

        // Arma representada pelo drop
        this.weapon = weapon;

        // Distância para permitir a troca
        this.hitboxSize = weapon.sprite;

        // Brilho
        this.glow = {
            time: Math.random() * Math.PI * 2,
            alpha: 0.7,
            radius: weapon.sprite
        };
    }

    rangeCatch() {
        return Math.hypot(
            player.x - this.x,
            player.y - this.y
        ) < this.hitboxSize;
    }

    swapWeapon() {
        const weaponAtual = player.weapon;
        player.equipWeapon(this.weapon);
        this.weapon = weaponAtual;
        // evita trocar várias vezes segurando a tecla
        player.keys["e"] = false;
    }

    update(deltaTime) {

        // animação do brilho
        this.glow.time += deltaTime * 3;

        this.glow.alpha =
            0.55 + Math.sin(this.glow.time) * 0.15;

        this.glow.radius =
            this.weapon.sprite *
            (0.8 + Math.sin(this.glow.time) * 0.08);

        if (!this.rangeCatch())
            return;

        if (player.keys["e"]) {
            this.swapWeapon();
        }
    }

    draw() {

        const camX = player.x - LARGURA / 2;
        const camY = player.y - ALTURA / 2;

        const screenX = this.x - camX;
        const screenY = this.y - camY;

        // ---------------- Glow ----------------

        const gradient = ctx.createRadialGradient(
            screenX,
            screenY,
            0,
            screenX,
            screenY,
            this.glow.radius
        );

        gradient.addColorStop(0, `rgba(255,255,180,${this.glow.alpha})`);
        gradient.addColorStop(0.6, `rgba(255,255,180,${this.glow.alpha * 0.35})`);
        gradient.addColorStop(1, "rgba(255,255,180,0)");

        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.arc(
            screenX,
            screenY,
            this.glow.radius,
            0,
            Math.PI * 2
        );
        ctx.fill();

        // ---------------- Arma ----------------

        const size = this.weapon.sprite;

        ctx.drawImage(
            this.weapon.getSprite(),
            screenX - size / 2,
            screenY - size / 2,
            size,
            size
        );

        // ---------------- Texto ----------------

        if (this.rangeCatch()) {

            ctx.fillStyle = "white";
            ctx.font = "18px GamerFonte";
            ctx.textAlign = "center";

            ctx.fillText(
                "Pressione E para trocar",
                screenX,
                screenY - size
            );

            ctx.textAlign = "left";
        }
    }
}

