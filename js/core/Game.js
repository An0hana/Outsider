import { AssetManager } from './AssetManager.js';
import { InputHandler } from './InputHandler.js';
import { Scene } from './Scene.js';
import { RendererSystem } from '../systems/RendererSystem.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.lastTime = 0;
        this.isRunning = false;

        this.inputHandler = new InputHandler();
        this.assetManager = new AssetManager();
        this.renderer = new RendererSystem(this.ctx);
        this.scene = null;

        this._gameLoop = this._gameLoop.bind(this);
    }

    async start() {
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        
        console.log("Loading assets...");
        await this.assetManager.loadAll();
        console.log("Assets loaded.");
        
        this.scene = new Scene(this.assetManager);
        this.isRunning = true;
        this.lastTime = performance.now();
        
        requestAnimationFrame(this._gameLoop);
    }

    _gameLoop(timestamp) {
        if (!this.isRunning) return;

        const deltaTime = (timestamp - this.lastTime);
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        this.inputHandler.consumeActionKeys();
        requestAnimationFrame(this._gameLoop);
    }

    update(deltaTime) {
        this.scene.update(deltaTime, this.inputHandler);
    }

    draw() {
        this.renderer.render(this.scene);
    }

    _resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.renderer) {
            this.renderer.onResize(this.canvas.width, this.canvas.height);
        }
    }
}