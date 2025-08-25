//所有游戏状态的基类
//定义了所有状态都必须具备的jiekou
export class BaseState {
    constructor() {
        //对Game核心实例的引用
        this.game = null;
        //对GameStateManager的引用，用于请求状态切换
        this.manager = null;
    }
    //当进入此状态时被调用，可接受来自前一个状态的参数
    enter(params) {}
    //当离开此状态时被调用，用于清理工作
    exit() {}
    //每帧更新逻辑
    update(deltaTime, input) {}
    //每帧绘制逻辑
    draw() {}
}
