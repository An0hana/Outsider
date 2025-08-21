// js/main.js (已修正)

// ==================== 修正点 ====================
// 在文件顶部导入所有需要的模块。
// 这一行很可能就是你缺失的，它告诉 main.js 从哪里找到 loadSpriteSheet 和 loadImage 函数。
import { states } from './constants.js';
import { loadSpriteSheet, loadImage } from './utils.js';
import { InputHandler } from './inputHandler.js';
import { Player } from './player.js';

// 移除 window.addEventListener('load', ...)，因为模块默认就是延迟加载的
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player;
let input;
let bg;

// 资源加载函数 (现在可以设为 async function)
async function loadAssets() {
    const [
        idleData, walkData, jumpData, fallData, landData, attackData, slashImg, backgroundImg
    ] = await Promise.all([
        loadSpriteSheet("./sprites/idle.png", 9), // 路径最好加上 ./
        loadSpriteSheet("./sprites/walk.png", 8),
        loadSpriteSheet("./sprites/jump.png", 9),
        loadSpriteSheet("./sprites/fall.png", 3),
        loadSpriteSheet("./sprites/land.png", 3),
        loadSpriteSheet("./sprites/attack.png", 5),
        loadImage("./sprites/lr1.png"),
        loadImage("./sprites/background.png")
    ]);

    bg = backgroundImg;

    return {
        idleFrames: idleData.frames,
        walkFrames: walkData.frames,
        jumpFrames: jumpData.frames,
        fallFrames: fallData.frames,
        landFrames: landData.frames,
        attackFrames: attackData.frames,
        slashFrame: slashImg,
        frameSizes: {
            idle: { w: idleData.frameWidth, h: idleData.frameHeight },
            walk: { w: walkData.frameWidth, h: walkData.frameHeight },
            jump: { w: jumpData.frameWidth, h: jumpData.frameHeight },
            fall: { w: fallData.frameWidth, h: fallData.frameHeight },
            land: { w: landData.frameWidth, h: landData.frameHeight },
            attack: { w: attackData.frameWidth, h: attackData.frameHeight },
        }
    };
}

// 初始化函数
function init(assets) {
    input = new InputHandler();
    player = new Player(canvas.width, canvas.height, assets);
    
    player.y = canvas.height - 500;
    player.velocityY = 0;
    player.setState(states.FALL);
    
    gameLoop();
}

// 游戏循环函数
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (bg) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

    player.update(input);
    player.draw(ctx);

    input.consumeActionKeys();
    
    requestAnimationFrame(gameLoop);
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(player){
        player.canvasWidth = canvas.width;
        player.canvasHeight = canvas.height;
    }
});

// 启动游戏 (现在可以直接调用)
loadAssets().then(assets => {
    init(assets);
});