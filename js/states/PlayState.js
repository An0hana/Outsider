//引入基类、场景和UI管理器
import { BaseState } from './BaseState.js';
import { Scene } from '../core/Scene.js';
import { UIManager } from '../ui/UIManager.js';

//代表游戏正在进行的状态
export class PlayState extends BaseState {
    constructor() {
        super();           
        this.scene = null;    //当前的游戏场景
        this.uiManager = null;//UI管理器
    }

    //进入此状态时执行
    enter(params) {
        console.log("进入游戏状态");
        //根据传入的关卡名创建新的实例
        this.scene = new Scene(params.level, this.game.assetManager);
        //创建UI管理器实例
        this.uiManager = new UIManager(this.game.canvas); 
    }

    //离开此状态时执行
    exit() {
        console.log("退出游戏状态");
        //清理场景和UI管理器，释放内存
        this.scene = null;
        this.uiManager = null;
    }

    //每帧更新，委托给场景
    update(deltaTime, input) {
        if (this.scene) {
            this.scene.update(deltaTime, input);
        }
    }

    //每帧绘制
    draw() {
        //先绘制游戏世界
        if (this.scene) {
            this.game.renderer.render(this.scene);
        }
        //在绘制UI层
        if (this.uiManager) {
            this.uiManager.draw();
        }
    }
}