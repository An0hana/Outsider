//导入游戏引擎核心类Game
import { Game } from './core/Game.js';

//监听窗口的 ‘load’ 事件，确保所有HTML和资源都已加载完毕再开始游戏 
window.addEventListener('load', () =>{
    //获取HTML中的画板
    const canvas = document.getElementById('gameCanvas');
    //若找不到画板，在控制台打印错误并退出
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    //创建Game类的实例，将画板作为参数传入
    const game = new Game(canvas);
    //启动游戏
    game.start();
})