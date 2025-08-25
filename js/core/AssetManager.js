//导入资源加载工具函数
import { loadSpriteSheet, loadImage, loadJSON } from '../utils/loaders.js';
//负责管理游戏的所有资源（图片、精灵图、JSON等）
export class AssetManager {
    constructor() {
        //使用Map来储存不同类型的资源，便于通过键名快速查找
        this.images = new Map();
        this.jsons = new Map();
        this.spriteSheets = new Map();
    }

    //异步加载所有游戏所需资源
    async loadAll() {
        const [
            idleData, walkData, jumpData, fallData, landData, attackData,
            slashImg, tilesetImg,
            mapLevel1Data, mapLevel2Data
        ] = await Promise.all([
            loadSpriteSheet("assets/sprites/player/idle.png", 9),
            loadSpriteSheet("assets/sprites/player/walk.png", 8),
            loadSpriteSheet("assets/sprites/player/jump.png", 9),
            loadSpriteSheet("assets/sprites/player/fall.png", 3),
            loadSpriteSheet("assets/sprites/player/land.png", 3),
            loadSpriteSheet("assets/sprites/player/attack.png", 5),
            loadImage("assets/sprites/player/lr1.png"),
            loadImage("assets/sprites/tileset.png"),
            loadJSON("assets/maps/level1.json"),
            loadJSON("assets/maps/level2.json"),
        ]);
        //将加载并处理好的精灵图数据存入map
        this.spriteSheets.set('idle', idleData);
        this.spriteSheets.set('walk', walkData);
        this.spriteSheets.set('jump', jumpData);
        this.spriteSheets.set('fall', fallData);
        this.spriteSheets.set('land', landData);
        this.spriteSheets.set('attack', attackData);
        //将加载好的图片存入map
        this.images.set('slash', slashImg);
        this.images.set('tileset', tilesetImg);
        //将加载好的JSON数据存入map
        this.jsons.set('level1.json', mapLevel1Data);
        this.jsons.set('level2.json', mapLevel2Data);
    }

    //根据名称获取精灵图数据
    getSpriteSheet(name) { return this.spriteSheets.get(name); }
    //根据名称获取图片对象
    getImage(name) { return this.images.get(name); }
    //根据名称获取JSON对象
    getJson(name) { return this.jsons.get(name); }
}