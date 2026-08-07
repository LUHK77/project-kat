export class WorldObject {

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update() {}

    draw() {}

    isSolid() {
        return false;
    }

    getHitbox() {
        return null;
    }
}