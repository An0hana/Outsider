export class Camera {
    constructor(viewportWidth, viewportHeight) {
        this.x = 0;
        this.y = 0;
        this.viewportWidth = viewportWidth;
        this.viewportHeight = viewportHeight;
    }

    update(target, tilemap) {
        if (!target) return;

        const deadzoneX = this.viewportWidth / 4;
        const deadzoneY = this.viewportHeight / 4;

        if (target.x > this.x + this.viewportWidth - deadzoneX) {
            this.x = target.x - (this.viewportWidth - deadzoneX);
        } else if (target.x < this.x + deadzoneX) {
            this.x = target.x - deadzoneX;
        }

        if (target.y > this.y + this.viewportHeight - deadzoneY) {
            this.y = target.y - (this.viewportHeight - deadzoneY);
        } else if (target.y < this.y + deadzoneY) {
            this.y = target.y - deadzoneY;
        }

        if (tilemap) {
            const mapWidthPixels = tilemap.mapWidth * tilemap.tileWidth;
            const mapHeightPixels = tilemap.mapHeight * tilemap.tileHeight;

            if (this.x < 0) this.x = 0;
            if (this.x > mapWidthPixels - this.viewportWidth) this.x = mapWidthPixels - this.viewportWidth;
            if (this.y < 0) this.y = 0;
            if (this.y > mapHeightPixels - this.viewportHeight) this.y = mapHeightPixels - this.viewportHeight;
        }
    }
}