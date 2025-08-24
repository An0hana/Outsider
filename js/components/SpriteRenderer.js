// js/components/SpriteRenderer.js (完整替换用代码)

import { TARGET_H } from '../constants.js';
import { Transform } from './Transform.js';
import { Animator } from './Animator.js';
import { StateMachine } from './StateMachine.js';

export class SpriteRenderer {
    constructor(slashFrame) {
        this.slashFrame = slashFrame;
    }

    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.animator = this.gameObject.getComponent(Animator);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }

    getDrawSize() {
        const size = this.animator.getFrameSize();
        if (size.h === 0) return { w: 0, h: 0 };
        const scale = TARGET_H / size.h;
        return { w: size.w * scale, h: size.h * scale };
    }

    draw(ctx) {
        const frameCanvas = this.animator.getCurrentFrame();
        if (!frameCanvas) return;

        const { w: drawW, h: drawH } = this.getDrawSize();

        ctx.save();
        
        // 核心逻辑：假设原始素材是朝左的
        if (this.transform.facingRight) { 
            // 如果状态是“朝右”，就进行水平翻转，让朝左的图变成朝右
            ctx.translate(this.transform.x + drawW, this.transform.y);
            ctx.scale(-1, 1);
            ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
        } else {
            // 如果状态是“朝左”，就直接绘制原始的、朝左的图
            ctx.drawImage(frameCanvas, this.transform.x, this.transform.y, drawW, drawH);
        }
        
        ctx.restore();

        this._drawSlash(ctx, drawW, drawH);
    }
    
    _drawSlash(ctx, playerW, playerH) {
        if (this.stateMachine && this.stateMachine.currentState.state === 'ATTACK') {
            const slashW = this.slashFrame.width;
            const slashH = this.slashFrame.height;
            const scale = playerH / slashH;
            const newW = slashW * scale;
            const newH = playerH;
            
            const offsetY = 0.5;
            const offsetX = 0.8;
            
            let slashX, slashY;
            
            ctx.save();
            if (this.transform.facingRight) { 
                // 朝右时，翻转刀光
                slashX = this.transform.x + playerW * (1 - offsetX);
                slashY = this.transform.y + playerH * offsetY;
                ctx.translate(slashX + newW, slashY);
                ctx.scale(-1, 1);
                ctx.drawImage(this.slashFrame, 0, 0, newW, newH);
            } else {
                // 朝左时，正常绘制
                slashX = this.transform.x + playerW * offsetX - newW;
                slashY = this.transform.y + playerH * offsetY;
                ctx.drawImage(this.slashFrame, slashX, slashY, newW, newH);
            }
            ctx.restore();
        }
    }
}