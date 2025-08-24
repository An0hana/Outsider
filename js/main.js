import { states } from './constants.js';
import { loadSpriteSheet, loadImage, loadJSON } from './utils.js';
import { InputHandler } from './inputHandler.js';
import { Player } from './player.js';
import Tilemap from './Tilemap.js';

//获取画板/画笔
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
//全屏显示
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
//全局变量
let player;
let input;
let tilemap;
let cameraX = 0;
let cameraY = 0; 

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
        mapData,
        tilesetImg
    ] = await Promise.all([
        //并行加载所有资源，解析完成方继续执行
        loadSpriteSheet("./sprites/idle.png", 9),
        loadSpriteSheet("./sprites/walk.png", 8),
        loadSpriteSheet("./sprites/jump.png", 9),
        loadSpriteSheet("./sprites/fall.png", 3),
        loadSpriteSheet("./sprites/land.png", 3),
        loadSpriteSheet("./sprites/attack.png", 5),
        loadImage("./sprites/lr1.png"),
        loadJSON("./maps/level1.json"),           
        loadImage("./sprites/tileset.png"),   
    ]);


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
        },
        mapData,     
        tilesetImg,
    };
}

// 初始化函数
function init(assets) {
    input = new InputHandler();
    tilemap = new Tilemap(assets.mapData, assets.tilesetImg);
  // 将 tilemap 实例传递给 Player
    player = new Player(canvas.width, canvas.height, assets, tilemap);
    //玩家初始状态
    player.y = canvas.height - 1000;
    player.velocityY = 0;
    player.setState(states.FALL);
    
    gameLoop();
}

// 游戏主循环
function gameLoop() {
// --- 更新相机 ---
  // 让相机中心对准玩家，但给他一点移动空间
  const cameraDeadzone = canvas.width / 4;
  if (player.x > cameraX + canvas.width - cameraDeadzone) {
      cameraX = player.x - (canvas.width - cameraDeadzone);
  } else if (player.x < cameraX + cameraDeadzone) {
      cameraX = player.x - cameraDeadzone;
  }

  if (player.y > cameraY + canvas.height - cameraDeadzone) {canvas.he
      cameraY = player.y - (canvas.height - cameraDeadzone);
  } else if (player.y < cameraY + cameraDeadzone) {
      cameraY = player.y - cameraDeadzone;
  }

  // --- 相机边界 ---
  const mapWidthPixels = tilemap.mapWidth * tilemap.tileWidth;
  const mapHeightPixels = tilemap.mapHeight * tilemap.tileHeight;
  if (cameraX < 0) cameraX = 0;
  if (cameraX > mapWidthPixels - canvas.width) cameraX = mapWidthPixels - canvas.width;
  if (cameraY < 0) cameraY = 0;
  if (cameraY > mapHeightPixels - canvas.height) cameraY = mapHeightPixels - canvas.height;


  ctx.save(); // 保存当前状态
  ctx.translate(-cameraX, -cameraY); // 将整个坐标系向左移动，模拟相机向右
  
  // 在移动后的坐标系中绘制所有游戏世界的内容
  if (tilemap) {
      tilemap.draw(ctx);
  }
  player.draw(ctx);
  
  ctx.restore(); // 恢复坐标系，这样UI等元素就不会受相机影响
  
  // 更新逻辑
  player.update(input);
  // player.draw(ctx); // <-- 把这行移动到 ctx.translate 内部
  
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