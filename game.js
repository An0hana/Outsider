// ==================== 画布初始化 ====================
//获取画板
const canvas = document.getElementById('gameCanvas');
///获取画笔
const ctx = canvas.getContext('2d');
//设置全屏
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ==================== 背景图 ====================
//加载背景图
const bg = new Image();
//设置背景图路径
bg.src = "background.png";

// ==================== 精灵表切帧 ====================
function loadSpriteSheet(path, frameCount, onComplete) {
  //加载精灵图
  const img = new Image();
  //设置精灵图路径
  img.src = path;
  //图片加载完成后，进行切帧处理
  img.onload = () => {
    //单帧宽度
    const frameWidth = img.width / frameCount;
    //单帧高度
    const frameHeight = img.height;
    //数组存放每一帧
    const frames = [];
    //遍历每一帧
    for (let i = 0; i < frameCount; i++) {
      //创建离屏画板
      const off = document.createElement('canvas');
      off.width = frameWidth;
      off.height = frameHeight;
      //创建离屏画笔
      const octx = off.getContext('2d');
      //绘制当前帧到离屏画板
      octx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
      //将当前帧存入数组
      frames.push(off);
    }
    /* 调用回调函数，传入帧数组和单帧尺寸 */
    onComplete(frames, frameWidth, frameHeight);
  };
}

// ==================== 资源加载 ====================
//帧数组
let idleFrames, walkFrames, jumpFrames, fallFrames, landFrames, attackFrames;
//原始单帧尺寸{w,h}
const frameSizes = {}; 
//加载各动作精灵表
//储存帧数组和单帧尺寸
//检查是否全部资源加载完毕
loadSpriteSheet("sprites/idle.png",   9, (f, w, h) => { idleFrames   = f; frameSizes.idle   = { w, h }; checkAllLoaded(); });
loadSpriteSheet("sprites/walk.png",   8, (f, w, h) => { walkFrames   = f; frameSizes.walk   = { w, h }; checkAllLoaded(); });
loadSpriteSheet("sprites/jump.png",   9, (f, w, h) => { jumpFrames   = f; frameSizes.jump   = { w, h }; checkAllLoaded(); });
loadSpriteSheet("sprites/fall.png",   3, (f, w, h) => { fallFrames   = f; frameSizes.fall   = { w, h }; checkAllLoaded(); });
loadSpriteSheet("sprites/land.png",   3, (f, w, h) => { landFrames   = f; frameSizes.land   = { w, h }; checkAllLoaded(); });
loadSpriteSheet("sprites/attack.png", 5, (f, w, h) => { attackFrames = f; frameSizes.attack = { w, h }; checkAllLoaded(); });

// ==================== 刀光（单帧） ====================
//加载刀光图片
let slashFrame = null;
const slashImg = new Image();
slashImg.src = "sprites/lr1.png";
slashImg.onload = () => {
  // 直接保存图片对象
  slashFrame = slashImg; 
};

//加载完成后检查是否所有资源都已加载
let allReady = false;
function checkAllLoaded() {
  // 检查所有帧数组是否已加载
  if (idleFrames && walkFrames && jumpFrames && fallFrames && landFrames && attackFrames && !allReady) {
    allReady = true;
    init();
    gameLoop();
  }
}

// ==================== 玩家与常量 ====================
//目标渲染高度，不同尺寸的帧会按此高度缩放
const TARGET_H = 120;
//行走前置帧数，决定行走动画的循环前置帧数
const WALK_PRE_COUNT = 3;

//玩家
const player = {
  x: 150,
  y: 0,
  velocityX: 0,
  velocityY: 0
};

//物理常量
const gravity   = 0.1;
const moveSpeed = 3;
const jumpPower = 5;
let facingRight = true;

// ==================== 状态机 ====================
//当前状态变量，初始为 "站立"
let state = "idle";
//当前帧索引
let currentFrame = 0;
//帧计数器，控制动画播放速度
let frameTimer = 0;

//状态对应的帧延迟
const frameDelayByState = {
  idle:   15,
  walk:   10,
  jump:   12,
  fall:   12,
  land:   5,
  attack: 3
};

//设置状态函数
function setState(next) {
  if (state === next) return;
  state = next;
  currentFrame = 0;
  frameTimer = 0;
}

// ==================== 开局 ====================
//初始化玩家位置和状态
function init() {
  player.y = canvas.height - 500;
  player.velocityY = 0;
  setState("fall");
}

// ==================== 输入 ====================
//存储按键状态
const keys = { ArrowLeft: false, ArrowRight: false, Space: false, Attack: false };

//监听键盘按下
window.addEventListener('keydown', (e) => {
  //忽略长按重复
  if (e.repeat) return;
  //左右行走
  if (e.code === 'ArrowLeft')  keys.ArrowLeft  = true;
  if (e.code === 'ArrowRight') keys.ArrowRight = true;

  //跳跃
  if (e.code === 'Space' && isOnGround()) {
    player.velocityY = -jumpPower;
    setState("jump");
  }
  
  //攻击
  if (e.code === 'KeyX') {
    keys.Attack = true;
    setState("attack");
  }
});

//监听键盘抬起
window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft')  keys.ArrowLeft  = false;
  if (e.code === 'ArrowRight') keys.ArrowRight = false;
  if (e.code === 'KeyZ')       keys.Attack     = false;
});

// ==================== 工具函数 ====================
//是否在地面
function isOnGround() {
  return player.y + TARGET_H >= canvas.height - 115;
}

//获取当前状态的绘制尺寸
function getDrawSize(s) {
  //获取当前状态的原始尺寸，找不到就用站立帧的
  const size = frameSizes[s] || frameSizes.idle;
  //计算缩放比例
  const scale = TARGET_H / size.h;
  //返回缩放后的新尺寸
  return { w: size.w * scale, h: size.h * scale };
}

//根据当前帧索引选择行走动画帧
function pickWalkFrame(frames, cf) {
  const total = frames.length;
  //起步帧数
  const pre   = WALK_PRE_COUNT;
  //循环帧数
  const loop  = total - pre;
  //起步阶段直接返回
  if (cf < pre) return frames[cf];
  //计算循环索引
  const loopIdx = (cf - pre) % loop;
  //返回对应的循环帧
  return frames[pre + loopIdx];
}

// ==================== 更新 ====================
function update() {
  //记录更新前的地面状态
  const wasOnGround = isOnGround();
  //水平移动
  player.velocityX = 0;
  if (keys.ArrowLeft)  { player.velocityX = -moveSpeed; facingRight = false; }
  if (keys.ArrowRight) { player.velocityX =  moveSpeed; facingRight = true;  }
  player.x += player.velocityX;
  //垂直移动
  player.velocityY += gravity;
  player.y += player.velocityY;
  //地面碰撞
  if (isOnGround()) {
    player.y = canvas.height - TARGET_H - 115;
    player.velocityY = 0;
  }
  //更新地面状态
  const nowOnGround = isOnGround();

  //不在攻击状态
  if (state !== "attack") {
    //在空中
    if (!nowOnGround) {
      //上升
      if (player.velocityY < 0 && state !== "jump") setState("jump");
      ///下降
      if (player.velocityY >= 0 && state !== "fall") setState("fall");
    } 
    //在地面
    else {
      //之前不在地面，现在在地面
      if (!wasOnGround && nowOnGround) {
        //之前是跳跃或下落状态
        if (state === "fall") setState("land");
        //根据情况切换
        else setState(Math.abs(player.velocityX) > 0 ? "walk" : "idle");
      } 
      //之前就在地面
      else {
        //不是着陆
        if (state !== "land") {
          setState(Math.abs(player.velocityX) > 0 ? "walk" : "idle");
        }
      }
    }
  } 
  // 在攻击状态
  else {
    const end = attackFrames.length - 1;
    //攻击动画播放完毕
    if (currentFrame >= end) {
      //根据情况切换
      if (!nowOnGround) setState("fall");
      else setState((keys.ArrowLeft || keys.ArrowRight) ? "walk" : "idle");
    }
  }

  //在着陆状态
  if (state === "land") {
    const end = landFrames.length - 1;
    //着陆动画播放完毕
    if (currentFrame >= end) {
      //切换到行走或站立状态
      setState((keys.ArrowLeft || keys.ArrowRight) ? "walk" : "idle");
    }
  }

  //动画帧更新
  frameTimer++;
  const delay = frameDelayByState[state] || 12;
  if (frameTimer >= delay) {
    frameTimer = 0;
    currentFrame++;
  }

  //边界检测
  const { w: drawW } = getDrawSize(state);
  if (player.x < 0) player.x = 0;
  if (player.x + drawW > canvas.width) player.x = canvas.width - drawW;
}

// ==================== 绘制 ====================

//绘制背景
function drawBackground(){
  //若背景加载完成
  if (bg.complete && bg.naturalWidth > 0) {
    //绘制背景图
    ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
  } 
  //若背景未加载完成
  else {
    //先画一个纯色背景
    ctx.fillStyle = "#0b0b0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

//获取人物动作帧
function pickFrame(){
  let frameCanvas = null;

}


//主绘画函数
function draw() {

  drawBackground();

  //当前播放动画帧
  let frameCanvas = null;
  //特殊处理行走帧（起步+循环）
  if (state === "walk") {
    frameCanvas = pickWalkFrame(walkFrames, currentFrame);
  } else {
    //其他状态直接选择对应帧
    const frames = (
      state === "idle"   ? idleFrames   :
      state === "jump"   ? jumpFrames   :
      state === "fall"   ? fallFrames   :
      state === "land"   ? landFrames   :
      state === "attack" ? attackFrames :
                           idleFrames// 默认使用站立帧
    );
    //循环播放动画帧
    frameCanvas = frames[currentFrame % frames.length];
  }
  //获取当前状态的绘制尺寸
  const { w: drawW, h: drawH } = getDrawSize(state);

  ///==================== 绘制玩家 ====================
  //保存当前画布状态
  ctx.save();
  //若面朝右
  if (facingRight) {
    //将坐标系原点移动到玩家右侧
    ctx.translate(player.x + drawW, player.y);
    //将坐标轴沿Y轴水平翻转
    ctx.scale(-1, 1);
    //在翻转后坐标系绘制
    ctx.drawImage(frameCanvas, 0, 0, drawW, drawH);
  } 
  //若面朝左
  else {
    //在原坐标系绘画
    ctx.drawImage(frameCanvas, player.x, player.y, drawW, drawH);
  }
  //恢复原画布状态，翻转只对主角生效
  ctx.restore();

  /// ==================== 绘制刀光 ====================
  //攻击状态
  if (state === "attack") {
    //刀光的宽高
    const slashW = slashFrame.width;
    const slashH = slashFrame.height;

    // 按人物高度缩放刀光
    const scale = drawH / slashH;      // 比例因子
    const newW  = slashW * scale;      // 缩放后的宽度
    const newH  = drawH;               // 高度和人物一致

    // 偏移参数
    const offsetY = 0.5;  // 往上
    const offsetX = 0.8;  // 往前

    let slashX, slashY;
    if (facingRight) {
      // 向右攻击：翻转刀光
      slashX = player.x + drawW * offsetX;
      slashY = player.y + drawH * offsetY;
      ctx.save();
      ctx.translate(slashX + newW, slashY);
      ctx.scale(-1, 1);
      ctx.drawImage(slashFrame, 0, 0, newW, newH);  
      ctx.restore();
    } else {
      // 向左攻击直接画
      slashX = player.x - newW * offsetX;
      slashY = player.y + drawH * offsetY;
      ctx.drawImage(slashFrame, slashX, slashY, newW, newH); 
    }
  }

}

// ==================== 主循环 ====================
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}
