// js/player.js (已修正)

class Player {
    constructor(canvasWidth, canvasHeight, assets) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.assets = assets;

        this.x = 150;
        this.y = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.facingRight = true; // 初始朝向，可以根据你的设计调整

        this.currentFrame = 0;
        this.frameTimer = 0;

        this.states = [
            new IdleState(this),
            new WalkState(this),
            new JumpState(this),
            new FallState(this),
            new LandState(this),
            new AttackState(this),
        ];
        this.currentState = null;
    }

    setState(stateIndex) {
        if (this.currentState === this.states[stateIndex]) return;
        this.currentState = this.states[stateIndex];
        this.currentState.enter();
    }

    update(input) {
        // 1. 让当前状态处理输入和逻辑
        this.currentState.handleInput(input);

        // 2. 水平移动
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

        // 3. 垂直移动与重力
        this.y += this.velocityY;
        if (!this.isOnGround()) {
            this.velocityY += GRAVITY;
        } else {
            this.velocityY = 0;
            this.y = this.canvasHeight - TARGET_H - 115;
        }

        // 4. 边界检测
        const { w: drawW } = this.getDrawSize();
        if (this.x < 0) this.x = 0;
        if (this.x + drawW > this.canvasWidth) this.x = this.canvasWidth - drawW;
        
        // 5. 动画帧更新
        this.updateAnimation();
    }
    
    updateAnimation(){
        this.frameTimer++;
        const stateName = this.currentState.state.toLowerCase();
        const delay = frameDelayByState[stateName] || 12;
        if (this.frameTimer >= delay) {
            this.frameTimer = 0;
            this.currentFrame++;
        }
    }

    draw(ctx) {
        const { w: drawW, h: drawH } = this.getDrawSize();
        const frameCanvas = this.pickFrame();

        ctx.save();
        // ==================== 逻辑修正点 1 ====================
        // 你的原始逻辑是：当 facingRight 为 true 时翻转
        // 这意味着你的原始精灵图是朝左的
        if (this.facingRight) { // <--- 已从 !this.facingRight 修改为 this.facingRight
            ctx.translate(this.x + drawW, this.y);
            ctx.scale(-1, 1);
            ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
        } else {
            ctx.drawImage(frameCanvas, this.x, this.y, drawW, drawH);
        }
        ctx.restore();

        this.drawSlash(ctx, drawW, drawH);
    }
    
    drawSlash(ctx, playerW, playerH){
        if (this.currentState.state === 'ATTACK') {
            const { slashFrame } = this.assets;
            const slashW = slashFrame.width;
            const slashH = slashFrame.height;

            const scale = playerH / slashH;
            const newW = slashW * scale;
            const newH = playerH;

            const offsetY = 0.5;
            const offsetX = 0.8;

            let slashX, slashY;
            
            ctx.save();
            // ==================== 逻辑修正点 2 ====================
            // 同样，刀光也要在朝右时翻转
            if (this.facingRight) { // <--- 已从 !this.facingRight 修改为 this.facingRight
                slashX = this.x + playerW * offsetX;
                slashY = this.y + playerH * offsetY;
                ctx.translate(slashX + newW, slashY);
                ctx.scale(-1, 1);
                ctx.drawImage(slashFrame, 0, 0, newW, newH);
            } else {
                slashX = this.x - newW * offsetX;
                slashY = this.y + playerH * offsetY;
                ctx.drawImage(slashFrame, slashX, slashY, newW, newH);
            }
            ctx.restore();
        }
    }

    isOnGround() {
        return this.y + TARGET_H >= this.canvasHeight - 115;
    }

    getDrawSize() {
        const stateName = this.currentState ? this.currentState.state.toLowerCase() : 'idle';
        const size = this.assets.frameSizes[stateName] || this.assets.frameSizes.idle;
        const scale = TARGET_H / size.h;
        return { w: size.w * scale, h: size.h * scale };
    }

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