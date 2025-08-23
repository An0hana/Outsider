import { states, JUMP_POWER } from './constants.js';

//基类状态
class State {
    constructor(state, player) {
        this.state = state;
        this.player = player;
    }
    //初始化
    enter() {}
    //处理输入
    handleInput(input) {}
    //更新该状态下逻辑
    update() {}
}


export class IdleState extends State {
    constructor(player) {
        super('IDLE', player);
    }
    enter() {
        //重置帧索引和计时器
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        if ((input.keys.ArrowLeft || input.keys.ArrowRight) && !(input.keys.ArrowLeft && input.keys.ArrowRight)) {
            this.player.setState(states.WALK);
        } else if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (input.keys.Space && this.player.isOnGround()) {
            this.player.setState(states.JUMP);
        }
    }
}

export class WalkState extends State {
    constructor(player) {
        super('WALK', player);
    }
    enter() {
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        if (!(input.keys.ArrowLeft || input.keys.ArrowRight) || (input.keys.ArrowLeft && input.keys.ArrowRight)) {
            this.player.setState(states.IDLE);
        } else if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (input.keys.Space && this.player.isOnGround()) {
            this.player.setState(states.JUMP);
        }
    }
}

export class JumpState extends State {
    constructor(player) {
        super('JUMP', player);
    }
    enter() {
        if (this.player.isOnGround()) {
            this.player.velocityY = -JUMP_POWER;
            this.player.frameTimer = 0;
            this.player.currentFrame = 0;
        }
    }
    handleInput(input) {
         if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (this.player.velocityY >= 0) {
            this.player.setState(states.FALL);
        }
    }
}

export class FallState extends State {
    constructor(player) {
        super('FALL', player);
    }
    enter() {
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (this.player.isOnGround()) {
            this.player.setState(states.LAND);
        }
    }
}

export class LandState extends State {
    constructor(player) {
        super('LAND', player);
    }
    enter() {
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        const animationFinished = this.player.currentFrame >= this.player.assets.landFrames.length - 1;
        if (animationFinished) {
            if (input.keys.ArrowLeft || input.keys.ArrowRight) {
                this.player.setState(states.WALK);
            } else {
                this.player.setState(states.IDLE);
            }
        }
    }
}

export class AttackState extends State {
    constructor(player) {
        super('ATTACK', player);
    }
    enter() {
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        const animationFinished = this.player.currentFrame >= this.player.assets.attackFrames.length - 1;
        if (animationFinished) {
            if (!this.player.isOnGround()) {
                this.player.setState(states.FALL);
            } else if (input.keys.ArrowLeft || input.keys.ArrowRight) {
                this.player.setState(states.WALK);
            } else {
                this.player.setState(states.IDLE);
            }
        }
    }
}