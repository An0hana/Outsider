// js/game/Tilemap.js (完整替换用代码)

export default class Tilemap {
    constructor(mapData, tilesetImg) {
        this.mapData = mapData;
        this.tileset = tilesetImg;

        this.tileWidth = mapData.tilewidth;
        this.tileHeight = mapData.tileheight;
        this.mapWidth = mapData.width;
        this.mapHeight = mapData.height;

        const ts0 = mapData.tilesets?.[0] ?? {};
        this.firstgid = ts0.firstgid ?? 1;
        this.columns = ts0.columns ?? Math.floor(this.tileset.width / this.tileWidth);
        
        this.drawableLayers = this.mapData.layers.filter(
            layer => layer.type === 'tilelayer' && layer.visible
        );

        this.collisionLayer = this.mapData.layers.find(
            layer => layer.name.toLowerCase() === 'collision'
        );
    }

    getTileCoords(gid) {
        if (!gid || gid < this.firstgid) return null;
        const id = gid - this.firstgid;
        const sx = (id % this.columns) * this.tileWidth;
        const sy = Math.floor(id / this.columns) * this.tileHeight;
        return { sx, sy };
    }

    draw(ctx) {
        for (const layer of this.drawableLayers) {
            if (layer.opacity < 1) {
                ctx.save();
                ctx.globalAlpha = layer.opacity;
            }

            for (let r = 0; r < this.mapHeight; r++) {
                for (let c = 0; c < this.mapWidth; c++) {
                    const gid = layer.data[r * this.mapWidth + c] || 0;
                    if (gid === 0) continue;

                    const coords = this.getTileCoords(gid);
                    if (!coords) continue;
                    
                    ctx.drawImage(
                        this.tileset,
                        coords.sx, coords.sy, this.tileWidth, this.tileHeight,
                        c * this.tileWidth, r * this.tileHeight, this.tileWidth, this.tileHeight
                    );
                }
            }

            if (layer.opacity < 1) {
                ctx.restore();
            }
        }
    }

    getTile(worldX, worldY) {
        const col = Math.floor(worldX / this.tileWidth);
        const row = Math.floor(worldY / this.tileHeight);

        if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return 0;
        if (!this.collisionLayer || !this.collisionLayer.data) return 0;

        return this.collisionLayer.data[row * this.mapWidth + col] || 0;
    }

    isSolid(worldX, worldY) {
        const tileId = this.getTile(worldX, worldY);
        return tileId !== 0;
    }
}