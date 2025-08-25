//引入状态基类
import { BaseState } from './BaseState.js';

//代表游戏的标题（主菜单)状态
export class TitleState extends BaseState {
    //进入此状态时执行
    enter() {
        console.log("进入标题状态");
    }

    //每帧更新，主要监听开始游戏的输入
    update(deltaTime, input) {
        //如果玩家按下了攻击键或者空格键
        if (input.keys.Space || input.keys.Attack) {
            //请求状态管理器切换到PlayState，并指定加载第一关
            this.manager.setState('PLAY', { level: 'level1.json' });
        }
    }

    //每帧绘制，绘制标题和提示文字
    draw() {
        //从game对象中获取渲染上下文和canvas
        const { ctx, canvas } = this.game;
        //绘制黑色背景
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        //设置字体样式并绘制游戏标题
        ctx.fillStyle = 'white';
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Outsider: 交互式故事', canvas.width / 2, canvas.height / 3);
        //绘制“按键开始”的提示
        ctx.font = '24px sans-serif';
        ctx.fillText('按 X 或 空格键 开始', canvas.width / 2, canvas.height / 2);
    }
}