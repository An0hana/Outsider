//负责监听和管理用户的所有输入
export class InputHandler {
    constructor() {
        //储存当前状态
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Attack: false,
        };
        //监听全局键盘按下事件
        window.addEventListener('keydown', (e) => {
            if (e.repeat) return;
            this._setKey(e.code, true);
        });
        //监听全局键盘抬起事件
        window.addEventListener('keyup', (e) => {
            this._setKey(e.code, false);
        });
    }

    //根据键盘事件的code来设置内部按键状态
    _setKey(code, value) {
        switch (code) {
            case 'ArrowLeft': this.keys.ArrowLeft = value; break;
            case 'ArrowRight': this.keys.ArrowRight = value; break;
            case 'Space': this.keys.Space = value; break;
            case 'KeyX': this.keys.Attack = value; break;
        }
    }

    //消耗一次性的动作按键状态，防止连续触发
    consumeActionKeys() {
        this.keys.Space = false;
        this.keys.Attack = false;
    }
}