import { Zombie } from './Models/Zombie.js';
import { EvilBunny } from './Models/EvilBunny.js';
import { ZombieDog } from './Models/ZombieDog.js';
import { ZombieBird } from './Models/ZombieBird.js';

import { player } from './Models/Player.js';
import { enemies } from './Models/Enemy.js';
import { state as upgradeState } from './upgradeUI.js';

// função que realiza o spawn de inimigos e da uma probabilidade de inimigos especiais
export function spawnEnemy() {
    if (upgradeState.escolhendoUpgrade) return;

    const angulo = Math.random() * Math.PI * 2;
    const distancia = 400 + Math.random() * 200;

    const x = player.x + Math.cos(angulo) * distancia;
    const y = player.y + Math.sin(angulo) * distancia;

    const inimigoEspecial = Math.floor(Math.random() * 100) + 1;

    if (inimigoEspecial <= 10) {
        enemies.push(new EvilBunny(x, y));

    } else if (inimigoEspecial <= 20) {
        enemies.push(new ZombieDog(x, y));

    } else if (inimigoEspecial <= 30) {
        enemies.push(new ZombieBird(x, y));

    } else {
        enemies.push(new Zombie(x, y));
    }
}