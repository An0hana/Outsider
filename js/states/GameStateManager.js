//负责管理和切换整个游戏的不同状态
export class GameStateManager {
    constructor(game) {
        this.game = game;        //对Game核心实例的引用
        this.states = new Map(); //使用Map存储所有已注册的状态
        this.currentState = null;//当前激活的状态
    }

    addState(name, stateInstance) {
        this.states.set(name, stateInstance);
        //为状态实例注入game和maneger的引用，方便其内部调用
        stateInstance.game = this.game; 
        stateInstance.manager = this;
    }

    //设置当前的游戏状态
    setState(name, enterParams = {}) {
        //如果有当前的游戏状态，则调用其exit方法进行清理
        if (this.currentState) {
            this.currentState.exit();
        }
        //从Map中获取新的状态实例
        const newState = this.states.get(name);
        if (!newState) {
            console.error(`状态 "${name}" 未找到.`);
            return;
        }
        
        console.log(`切换到状态: ${name}`);
        //更新当前状态
        this.currentState = newState;
        //调用新状态的enter方法，并传入参数
        this.currentState.enter(enterParams);
    }

    //更新逻辑，委托给当前激活的状态
    update(deltaTime, input) {
        if (this.currentState) {
            this.currentState.update(deltaTime, input);
        }
    }

    //绘制逻辑，委托给当前激活的状态
    draw() {
        if (this.currentState) {
            this.currentState.draw();
        }
    }
}
