import { loadSpriteSheet, loadImage, loadJSON } from '../utils/loaders.js';

export class AssetManager {
    constructor() {
        this.images = new Map();
        this.jsons = new Map();
        this.spriteSheets = new Map();
    }

    async loadAll() {
        const [
            idleData, walkData, jumpData, fallData, landData, attackData,
            slashImg, tilesetImg,
            mapData
        ] = await Promise.all([
            // SpriteSheets
            loadSpriteSheet("./sprites/idle.png", 9),
            loadSpriteSheet("./sprites/walk.png", 8),
            loadSpriteSheet("./sprites/jump.png", 9),
            loadSpriteSheet("./sprites/fall.png", 3),
            loadSpriteSheet("./sprites/land.png", 3),
            loadSpriteSheet("./sprites/attack.png", 5),
            // Images
            loadImage("./sprites/lr1.png"),
            loadImage("./sprites/tileset.png"),
            // JSON
            loadJSON("./maps/level1.json"),
        ]);

        this.spriteSheets.set('idle', idleData);
        this.spriteSheets.set('walk', walkData);
        this.spriteSheets.set('jump', jumpData);
        this.spriteSheets.set('fall', fallData);
        this.spriteSheets.set('land', landData);
        this.spriteSheets.set('attack', attackData);
        
        this.images.set('slash', slashImg);
        this.images.set('tileset', tilesetImg);

        this.jsons.set('mapData', mapData);
    }

    getSpriteSheet(name) { return this.spriteSheets.get(name); }
    getImage(name) { return this.images.get(name); }
    getJson(name) { return this.jsons.get(name); }
}