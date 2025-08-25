//引入必要组件
import { Camera } from './Camera.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { Transform } from '../components/Transform.js';

//负责将整个游戏场景绘制到屏幕上
export class RendererSystem {
    constructor(ctx) {
        this.ctx = ctx;
        this.camera = new Camera(ctx.canvas.width, ctx.canvas.height);
    }

    //窗口尺寸变化时调用，更新摄像机的视口大小
    onResize(width, height) {
        this.camera.viewportWidth = width;
        this.camera.viewportHeight = height;
    }

    //主渲染函数，每帧都调用
    render(scene) {
        const { tilemap, player } = scene;
        
        //如果场景中有玩家，则让摄像机跟随玩家
        if (player) {
            const playerTransform = player.getComponent(Transform);
            this.camera.update(playerTransform, tilemap);
        }

        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.save();
        this.ctx.translate(-this.camera.x, -this.camera.y);

        //绘制瓦片地图
        if (tilemap) {
            tilemap.draw(this.ctx);
        }

        //遍历场景中的所有Object并绘制
        for (const gameObject of scene.gameObjects) {
            if (!gameObject.active) continue;
            const renderer = gameObject.getComponent(SpriteRenderer);
            //如果物体有SpriteRenderer方法，则调用其draw方法
            if (renderer) {
                renderer.draw(this.ctx);
            }
        }
        //恢复渲染状态
        this.ctx.restore();
    }
}