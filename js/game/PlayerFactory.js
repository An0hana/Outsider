import { GameObject } from '../core/GameObject.js';
import { Transform } from '../components/Transform.js';
import { Physics } from '../components/Physics.js';
import { PlayerController } from '../components/PlayerController.js';
import { Animator } from '../components/Animator.js';
import { SpriteRenderer } from '../components/SpriteRenderer.js';
import { StateMachine } from '../components/StateMachine.js';
import { IdleState, WalkState, JumpState, FallState, LandState, AttackState } from './playerStates.js';
import { states } from '../constants.js';

export function createPlayer(assetManager) {
    const player = new GameObject('Player');

    player.addComponent(new Transform(150, -200));
    
    const animations = {
        idle: assetManager.getSpriteSheet('idle'),
        walk: assetManager.getSpriteSheet('walk'),
        jump: assetManager.getSpriteSheet('jump'),
        fall: assetManager.getSpriteSheet('fall'),
        land: assetManager.getSpriteSheet('land'),
        attack: assetManager.getSpriteSheet('attack'),
    };
    player.addComponent(new Animator(animations));
    
    const slashFrame = assetManager.getImage('slash');
    player.addComponent(new SpriteRenderer(slashFrame));
    player.addComponent(new Physics());
    
    const stateMachine = player.addComponent(new StateMachine());
    stateMachine.addState(states.IDLE, new IdleState(player));
    stateMachine.addState(states.WALK, new WalkState(player));
    stateMachine.addState(states.JUMP, new JumpState(player));
    stateMachine.addState(states.FALL, new FallState(player));
    stateMachine.addState(states.LAND, new LandState(player));
    stateMachine.addState(states.ATTACK, new AttackState(player));

    player.addComponent(new PlayerController());
    
    stateMachine.setState(states.FALL);

    return player;
}