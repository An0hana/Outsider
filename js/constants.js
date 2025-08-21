// js/constants.js

// 物理常量
const GRAVITY = 0.1;
const MOVE_SPEED = 3;
const JUMP_POWER = 5;

// 玩家渲染常量
const TARGET_H = 120; // 目标渲染高度
const WALK_PRE_COUNT = 3; // 行走动画的起步帧数

// 状态枚举，便于管理和引用
const states = {
    IDLE: 0,
    WALK: 1,
    JUMP: 2,
    FALL: 3,
    LAND: 4,
    ATTACK: 5,
};

// 状态对应的动画帧延迟
const frameDelayByState = {
    idle: 15,
    walk: 10,
    jump: 12,
    fall: 12,
    land: 5,
    attack: 3,
};