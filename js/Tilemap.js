// js/Tilemap.js
export default class Tilemap {
  constructor(mapData, tilesetImg, options = {}) {
    this.mapData   = mapData;
    this.tileset   = tilesetImg;

    // 基本尺寸
    this.tileWidth  = mapData.tilewidth;
    this.tileHeight = mapData.tileheight;
    this.mapWidth   = mapData.width;
    this.mapHeight  = mapData.height;

    // 处理 firstgid（防止条纹错位）
    const ts0 = mapData.tilesets?.[0] ?? {};
    this.firstgid = ts0.firstgid ?? 1;
    this.columns  = ts0.columns ?? Math.floor(this.tileset.width / this.tileWidth);

    // 渲染顺序：Background -> Collisions -> Front
    this.layerOrder = options.order ?? ['Back', 'Collision', 'Mid'];

    // 建立 name -> layer 的字典（不区分大小写）
    this.layers = Object.fromEntries(
      (mapData.layers || [])
        .filter(l => l.type === 'tilelayer' && Array.isArray(l.data))
        .map(l => [l.name.toLowerCase(), l])
    );

    // 碰撞层兜底（兼容 "Collision" 单数）
    this.collisionLayer = this.layers['collision']
  }

  // 将全局 gid 映射到 tileset 源图坐标
  getTileCoords(gid) {
    if (!gid) return null;               // 0 代表空
    const id = gid - this.firstgid;      // 去掉 firstgid 偏移
    if (id < 0) return null;             // 不属于当前 tileset
    const sx = (id % this.columns) * this.tileWidth;
    const sy = Math.floor(id / this.columns) * this.tileHeight;
    return { sx, sy };
  }

  // 渲染 3 个图层（按顺序）
  draw(ctx) {
    for (const name of this.layerOrder) {
      const layer = this.layers[name.toLowerCase()];
      if (!layer || !layer.data) continue;

      const offx = layer.offsetx || 0;
      const offy = layer.offsety || 0;
      const opa  = (layer.opacity ?? 1);
      if (opa !== 1) { ctx.save(); ctx.globalAlpha = opa; }

      for (let r = 0; r < this.mapHeight; r++) {
        for (let c = 0; c < this.mapWidth; c++) {
          const gid = layer.data[r * this.mapWidth + c] || 0;
          if (gid === 0) continue;

          const coords = this.getTileCoords(gid);
          if (!coords) continue; // 非本 tileset，跳过
          const { sx, sy } = coords;

          const dx = c * this.tileWidth  + offx;
          const dy = r * this.tileHeight + offy;

          ctx.drawImage(
            this.tileset,
            sx, sy, this.tileWidth, this.tileHeight,
            dx, dy, this.tileWidth, this.tileHeight
          );
        }
      }

      if (opa !== 1) ctx.restore();
    }
  }

  // 取某个图层上的瓦片（默认 Collision）
  getTile(worldX, worldY, layerName = 'Collision') {
    const col = Math.floor(worldX / this.tileWidth);
    const row = Math.floor(worldY / this.tileHeight);

    // 越界统一返回 0（空），避免被误判为墙
    if (col < 0 || col >= this.mapWidth || row < 0 || row >= this.mapHeight) return 0;

    const layer = this.layers[layerName.toLowerCase()];
    if (!layer || !layer.data) return 0;

    return layer.data[row * this.mapWidth + col] || 0;
  }
}
