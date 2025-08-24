import { Camera } from './Camera.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { Transform } from '../components/Transform.js';

export class RendererSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.camera = new Camera(ctx.canvas.width, ctx.canvas.height);
    }

    onResize(width, height) {
        this.camera.viewportWidth = width;
        this.camera.viewportHeight = height;
    }

    render(scene) {
        const { tilemap, player } = scene;
        
        // 1. Update camera to follow the player
        if (player) {
            const playerTransform = player.getComponent(Transform);
            this.camera.update(playerTransform, tilemap);
        }

        // 2. Clear and transform canvas
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        // 3. Draw tilemap
        if (tilemap) {
            tilemap.draw(this.ctx);
        }

        // 4. Draw all game objects
        for (const gameObject of scene.gameObjects) {
            const renderer = gameObject.getComponent(SpriteRenderer);
            if (renderer) {
                renderer.draw(this.ctx);
            }
        }

        this.ctx.restore();
        
        // 5. Draw UI here (not affected by camera)
    }
}