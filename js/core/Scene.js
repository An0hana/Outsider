import { createPlayer } from '../game/PlayerFactory.js';
import Tilemap from '../game/Tilemap.js';

export class Scene {
    constructor(assetManager) {
        this.assetManager = assetManager;
        this.gameObjects = [];
        this.player = null;
        this.tilemap = null;

        this._initialize();
    }

    _initialize() {
        const mapData = this.assetManager.getJson('mapData');
        const tilesetImg = this.assetManager.getImage('tileset');
        this.tilemap = new Tilemap(mapData, tilesetImg);

        this.player = createPlayer(this.assetManager);
        this.addGameObject(this.player);
    }

    addGameObject(gameObject) {
        gameObject.scene = this;
        this.gameObjects.push(gameObject);
    }

    update(deltaTime, input) {
        for (const gameObject of this.gameObjects) {
            gameObject.update(deltaTime, input);
        }
    }
}