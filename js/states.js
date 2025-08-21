import { states, JUMP_POWER } from './constants.js';

class State {
    constructor(state, player) {
        this.state = state;
        this.player = player;
    }
    enter() {}
    handleInput(input) {}
    update() {}
}

export class IdleState extends State {
    constructor(player) {
        super('IDLE', player);
    }
    enter() {
        this.player.frameTimer = 0;
        this.player.currentFrame = 0;
    }
    handleInput(input) {
        if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (input.keys.Space && this.player.isOnGround()) {
            this.player.setState(states.JUMP);
        } else if (input.keys.ArrowLeft || input.keys.ArrowRight) {
            this.player.setState(states.WALK);
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
        if (input.keys.Attack) {
            this.player.setState(states.ATTACK);
        } else if (input.keys.Space && this.player.isOnGround()) {
            this.player.setState(states.JUMP);
        } else if (!(input.keys.ArrowLeft || input.keys.ArrowRight)) {
            this.player.setState(states.IDLE);
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