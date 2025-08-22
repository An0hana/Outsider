//键盘输入处理
export class InputHandler {
    constructor() {
        //各键位状态
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Attack: false,
        };
        //监听键盘按下
        window.addEventListener('keydown', (e) => {
            //使一次性动作只发生一次
            if (e.repeat) return;

            switch (e.code) {
                case 'ArrowLeft':
                    this.keys.ArrowLeft = true;
                    break;
                case 'ArrowRight':
                    this.keys.ArrowRight = true;
                    break;
                case 'Space':
                    this.keys.Space = true;
                    break;
                case 'KeyX':
                    this.keys.Attack = true;
                    break;
            }
        });
        //监听键盘抬起
        window.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'ArrowLeft':
                    this.keys.ArrowLeft = false;
                    break;
                case 'ArrowRight':
                    this.keys.ArrowRight = false;
                    break;
                case 'Space':
                    this.keys.Space = false;
                    break;
                case 'KeyX':
                    this.keys.Attack = false;
                    break;
            }
        });
    }
    //重置一次性动作键位状态为false！！
    consumeActionKeys() {
        this.keys.Space = false;
        this.keys.Attack = false;
    }
}