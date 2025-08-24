export const GRAVITY = 0.1;
export const MOVE_SPEED = 3; 
export const JUMP_POWER = 5;

export const TARGET_H = 120; 
export const WALK_PRE_COUNT = 3;

export const states = {
    IDLE: 0,
    WALK: 1,
    JUMP: 2,
    FALL: 3,
    LAND: 4,
    ATTACK: 5,
};

export const frameDelayByState = {
    idle: 15,
    walk: 10,
    jump: 12,
    fall: 12,
    land: 5,
    attack: 4,
};