import { MOVE_SPEED, states } from '../constants.js';
import { Transform } from './Transform.js';
import { Physics } from './Physics.js';
import { StateMachine } from './StateMachine.js';

export class PlayerController {
    init() {
        this.transform = this.gameObject.getComponent(Transform);
        this.physics = this.gameObject.getComponent(Physics);
        this.stateMachine = this.gameObject.getComponent(StateMachine);
    }
    
    update(deltaTime, input) {
        // 1. Let the current state handle input first to decide on transitions
        this.stateMachine.currentState.handleInput(input);
        
        // 2. Apply movement based on input, if the state allows it
        if (this.stateMachine.currentState.state !== states.ATTACK) {
             this.physics.velocityX = 0;
            if (input.keys.ArrowLeft && !input.keys.ArrowRight) {
                this.physics.velocityX = -MOVE_SPEED;
                this.transform.facingRight = false;
            } else if (input.keys.ArrowRight && !input.keys.ArrowLeft) {
                this.physics.velocityX = MOVE_SPEED;
                this.transform.facingRight = true;
            }
        }
    }
}