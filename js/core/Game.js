import { AssetManager } from './AssetManager.js';
import { InputHandler } from './InputHandler.js';
import { RendererSystem } from '../systems/RendererSystem.js';
import { GameStateManager } from '../states/GameStateManager.js';
import { TitleState } from '../states/TitleState.js';
import { PlayState } from '../states/PlayState.js';
import { achievementManager } from '../services/AchievementManager.js';

//整个游戏的引擎核心和总控制器
export class Game {
    constructor(canvas) {
        //初始化canvas和2D渲染上下文
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        //用于计算时间差（deltaTime）
        this.lastTime = 0;
        this.isRunning = false;
        //实例化游戏的核心系统
        this.inputHandler = new InputHandler();
        this.assetManager = new AssetManager();
        this.renderer = new RendererSystem(this.ctx);
        this.stateManager = new GameStateManager(this);
        this.achievementManager = achievementManager;
        //绑定gameLoop的this上下文，确保在requestAnimationFrame中调用this时指向Game实例
        this._gameLoop = this._gameLoop.bind(this);
    }

    //异步启动游戏
    async start() {
        //初始化并监听canvas尺寸变化
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
        
        console.log("正在加载资源...");
        //等待所有资源加载完毕
        await this.assetManager.loadAll();
        console.log("资源加载完毕。");
        //向状态管理器中添加所有游戏状态
        this.stateManager.addState('TITLE', new TitleState());
        this.stateManager.addState('PLAY', new PlayState());
        //游戏开始运行
        this.isRunning = true;
        this.lastTime = performance.now();
        //设置初始状态为标题界面
        this.stateManager.setState('TITLE');
        //启动游戏主循环
        requestAnimationFrame(this._gameLoop);
    }

    //游戏主循环，每一帧都会被浏览器调用
    _gameLoop(timestamp) {
        if (!this.isRunning) return;
        //计算自上一帧以来的时间差，用于实现与帧率无关的动画和物理
        const deltaTime = (timestamp - this.lastTime);
        this.lastTime = timestamp;
        //更新游戏逻辑和绘制游戏画面
        this.update(deltaTime, this.inputHandler);
        this.draw();
        //消耗掉一次性动作的按键事件
        this.inputHandler.consumeActionKeys();
        //请求浏览器在下一帧重绘之前调用gameLoop
        requestAnimationFrame(this._gameLoop);
    }

    //更新游戏逻辑，委托给当前的状态管理器
    update(deltaTime, input) {
        this.stateManager.update(deltaTime, input);
    }

    //绘制游戏画面，委托给当前的状态管理器
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.stateManager.draw();
    }

    //调整canvas尺寸以匹配窗口大小
    _resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        //通知渲染系统尺寸已变化
        if (this.renderer) {
            this.renderer.onResize(this.canvas.width, this.canvas.height);
        }
    }
}