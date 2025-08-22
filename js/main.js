import { states } from './constants.js';
import { loadSpriteSheet, loadImage } from './utils.js';
import { InputHandler } from './inputHandler.js';
import { Player } from './player.js';

//获取画板/画笔
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
//全屏显示
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//全局变量
let player;
let input;
let bg;

// 资源加载函数 
async function loadAssets() {
    const [
        idleData, 
        walkData, 
        jumpData, 
        fallData, 
        landData, 
        attackData, 
        slashImg, 
        backgroundImg
    ] = await Promise.all([
        //并行加载所有资源，解析完成方继续执行
        loadSpriteSheet("./sprites/idle.png", 9),
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
        //将切割好的动画帧数分类存放
        idleFrames: idleData.frames,
        walkFrames: walkData.frames,
        jumpFrames: jumpData.frames,
        fallFrames: fallData.frames,
        landFrames: landData.frames,
        attackFrames: attackData.frames,
        //单独存放刀光图片
        slashFrame: slashImg,
        //存放每套动画原始单帧尺寸
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
    //玩家初始状态
    player.y = canvas.height - 500;
    player.velocityY = 0;
    player.setState(states.FALL);
    
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    //清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //绘制背景
    if (bg) {
        ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
    }

    player.update(input);
    player.draw(ctx);

    //消耗本帧使用过的一次性指令，防止下一帧重复触发
    input.consumeActionKeys();
    
    requestAnimationFrame(gameLoop);
}

// 监听窗口大小变化
window.addEventListener('resize', () => {
    //窗口大小改变时调节画布适应全屏
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if(player){
        //更新玩家内部记录画布尺寸
        player.canvasWidth = canvas.width;
        player.canvasHeight = canvas.height;
    }
});

// 启动游戏
loadAssets().then(assets => {
    //加载成功后初始化
    init(assets);
});