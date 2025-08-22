import { GRAVITY, 
         MOVE_SPEED, 
         TARGET_H, 
         WALK_PRE_COUNT, 
         frameDelayByState
} from './constants.js';
import { IdleState,
         WalkState, 
         JumpState, 
         FallState, 
         LandState, 
         AttackState 
} from './states.js';

export class Player {
    constructor(canvasWidth, canvasHeight, assets) {
        //画布尺寸
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        //已加载的游戏资源
        this.assets = assets;
        //位置
        this.x = 150;
        this.y = 0;
        //物理属性
        this.velocityX = 0;
        this.velocityY = 0;
        //初始朝向
        this.facingRight = true;
        //当前帧索引和帧计时器
        this.currentFrame = 0;
        this.frameTimer = 0;
        //状态
        this.states = [
            new IdleState(this),
            new WalkState(this),
            new JumpState(this),
            new FallState(this),
            new LandState(this),
            new AttackState(this),
        ];
        //初始化当前状态为null
        this.currentState = null;
    }


    //设置玩家状态
    setState(stateIndex) {
        //状态不变
        if (this.currentState === this.states[stateIndex]){
            return;
        }
        //切换新状态
        this.currentState = this.states[stateIndex];
        //初始化该状态
        this.currentState.enter();
    }

    //更新玩家状态
    update(input) {
        // 让当前状态处理键盘输入
        this.currentState.handleInput(input);

        // 水平移动
        this.velocityX = 0;
        // 在非攻击状态下才允许移动
        if (this.currentState.state !== 'ATTACK') {
            if (input.keys.ArrowLeft) {
                this.velocityX = -MOVE_SPEED;
                this.facingRight = false;
            }
            if (input.keys.ArrowRight) {
                this.velocityX = MOVE_SPEED;
                this.facingRight = true;
            }
        }
        this.x += this.velocityX;

        //垂直移动
        this.y += this.velocityY;
        if (!this.isOnGround()) {
            this.velocityY += GRAVITY;
        } else {
            this.velocityY = 0;
            this.y = this.canvasHeight - TARGET_H - 115;
        }

        //边界检测
        const { w: drawW } = this.getDrawSize();
        if (this.x < 0) this.x = 0;
        if (this.x + drawW > this.canvasWidth) this.x = this.canvasWidth - drawW;
        
        // 动画帧更新
        this.updateAnimation();
    }
    
    //动画帧更新
    updateAnimation(){
        //帧计时器递增
        this.frameTimer++;
        //获取当前状态及对应帧延迟
        const stateName = this.currentState.state.toLowerCase();
        const delay = frameDelayByState[stateName];
        //延迟结束更新下一帧
        if (this.frameTimer >= delay) {
            this.frameTimer = 0;
            this.currentFrame++;
        }
    }

    //玩家绘制
    draw(ctx) {
        //获取当前状态下绘画尺寸
        const { w: drawW, h: drawH } = this.getDrawSize();
        //获取当前应该被绘画的帧
        const frameCanvas = this.pickFrame();

        //保存当前画布状态（坐标系/变换）
        ctx.save();
        
        if (this.facingRight) {
            //朝右，坐标系翻转
            ctx.translate(this.x + drawW, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
        } else {
            //朝左，正常绘画
            ctx.drawImage(frameCanvas, this.x, this.y, drawW, drawH);
        }
        //恢复原画布状态
        ctx.restore();
        //刀光绘制
        this.drawSlash(ctx, drawW, drawH);
    }
    
    //刀光绘制
    drawSlash(ctx, playerW, playerH){
        if (this.currentState.state === 'ATTACK') {
            //获取刀光图片
            const { slashFrame } = this.assets;
            //获取刀光原始尺寸
            const slashW = slashFrame.width;
            const slashH = slashFrame.height;
            //根据玩家渲染高度缩放刀光比例
            const scale = playerH / slashH;
            const newW = slashW * scale;
            const newH = playerH;
            //刀光相对玩家偏移量
            const offsetY = 0.5;
            const offsetX = 0.8;
            //声明刀光最终绘制坐标
            let slashX, slashY;
            

            //保存画布状态
            ctx.save();
            if (this.facingRight) { 
                //朝右，翻转
                slashX = this.x + playerW * offsetX;
                slashY = this.y + playerH * offsetY;
                ctx.translate(slashX + newW, slashY);
                ctx.scale(-1, 1);
                ctx.drawImage(slashFrame, 0, 0, newW, newH);
            } else {
                //朝左，直接渲染
                slashX = this.x - newW * offsetX;
                slashY = this.y + playerH * offsetY;
                ctx.drawImage(slashFrame, slashX, slashY, newW, newH);
            }
            //恢复画布状态
            ctx.restore();
        }
    }

    //玩家地面状态
    isOnGround() {
        return this.y + TARGET_H >= this.canvasHeight - 115;
    }

    //玩家应被渲染的尺寸
    getDrawSize() {
        const stateName = this.currentState ? this.currentState.state.toLowerCase() : 'idle';
        const size = this.assets.frameSizes[stateName] || this.assets.frameSizes.idle;
        const scale = TARGET_H / size.h;
        return { w: size.w * scale, h: size.h * scale };
    }

    //当前应被渲染帧
    pickFrame() {
        const stateName = this.currentState.state.toLowerCase();
        if (stateName === "walk") {
            const total = this.assets.walkFrames.length;
            const pre = WALK_PRE_COUNT;
            const loop = total - pre;
            if (this.currentFrame < pre) return this.assets.walkFrames[this.currentFrame];
            const loopIdx = (this.currentFrame - pre) % loop;
            return this.assets.walkFrames[pre + loopIdx];
        } else {
            const frames = this.assets[stateName + 'Frames'] || this.assets.idleFrames;
            return frames[this.currentFrame % frames.length];
        }
    }
}