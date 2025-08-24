import { GRAVITY, 
         MOVE_SPEED, 
         TARGET_H, 
         WALK_PRE_COUNT, 
         frameDelayByState,
         states
} from './constants.js';
import { IdleState,
         WalkState, 
         JumpState, 
         FallState, 
         LandState, 
         AttackState 
} from './states.js';

export class Player {
    constructor(canvasWidth, canvasHeight, assets, tilemap) {
        //画布尺寸
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        //已加载的游戏资源
        this.assets = assets;
        this.tilemap = tilemap;
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
        const { w: drawW, h: drawH } = this.getDrawSize();
        // 让当前状态处理键盘输入
        this.currentState.handleInput(input);

        // 水平移动
        this.velocityX = 0;
        // 在非攻击状态下才允许移动
        if (this.currentState.state !== 'ATTACK') {
            if (input.keys.ArrowLeft) {
                this.velocityX -= MOVE_SPEED;
            }
            if (input.keys.ArrowRight) {
                this.velocityX += MOVE_SPEED;
            }
            if(this.velocityX > 0){
                this.facingRight = true;
            }
            if(this.velocityX < 0){
                this.facingRight = false;
            }
        }
        this.x += this.velocityX;

        if (this.velocityX > 0) {
            const rightSide = this.x + drawW;
            const middleY = this.y + drawH / 2;
            const tileId = this.tilemap.getTile(rightSide, middleY);
            if (tileId !== 0 && tileId !== null) {
                const tileLeft = Math.floor(rightSide / this.tilemap.tileWidth) * this.tilemap.tileWidth;
                this.x = tileLeft - drawW - 1; // -1 防止抖动
                this.velocityX = 0;
            }
        }else if (this.velocityX < 0) {
            const leftSide = this.x;
            const middleY = this.y + drawH / 2;
            const tileId = this.tilemap.getTile(leftSide, middleY);
            if (tileId !== 0 && tileId !== null) {
                const tileRight = (Math.floor(leftSide / this.tilemap.tileWidth) + 1) * this.tilemap.tileWidth;
                this.x = tileRight + 1; // +1 防止抖动
                this.velocityX = 0;
            }
        }

        //垂直移动
        this.velocityY += GRAVITY;
        this.y += this.velocityY;


        // 检查底部碰撞
        if (this.velocityY > 0) { // 只有在下落时才检查
        const feetX = this.x + drawW / 2;
        const feetY = this.y + drawH;
        const tileId = this.tilemap.getTile(feetX, feetY);

            if (tileId !== 0 && tileId !== null) {
                this.velocityY = 0;
                // 将玩家的位置“对齐”到瓦片的顶部，防止下沉
                const tileTop = Math.floor(feetY / this.tilemap.tileHeight) * this.tilemap.tileHeight;
                this.y = tileTop - drawH;
                
                    // 并且，如果当前状态是 FALL，就切换到 LAND
                    if (this.currentState.state === 'FALL') {
                    this.setState(states.LAND);
                    }
            }
        }
        
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

    // player.js -> isONGround 方法
    isOnGround() {
        
    // 获取玩家绘制后的尺寸
    const { w: drawW, h: drawH } = this.getDrawSize();
    // 检查玩家脚底中心点下方的瓦片
    const feetX = this.x + drawW / 2;
    const feetY = this.y + drawH + 1; // +1 เพื่อให้แน่ใจว่ามันอยู่ใต้เท้าของผู้เล่น

    const tileId = this.tilemap.getTile(feetX, feetY);
    // 如果瓦片ID不为0（表示有瓦片），则认为在地面上
    return tileId !== 0 && tileId !== null;
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