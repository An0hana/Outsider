// js/main.js

window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let player;
    let input;
    let bg;

    // 资源加载
    async function loadAssets() {
        const [
            idleData, walkData, jumpData, fallData, landData, attackData, slashImg, backgroundImg
        ] = await Promise.all([
            loadSpriteSheet("sprites/idle.png", 9),
            loadSpriteSheet("sprites/walk.png", 8),
            loadSpriteSheet("sprites/jump.png", 9),
            loadSpriteSheet("sprites/fall.png", 3),
            loadSpriteSheet("sprites/land.png", 3),
            loadSpriteSheet("sprites/attack.png", 5),
            loadImage("sprites/lr1.png"),
            loadImage("sprites/background.png")
        ]);

        bg = backgroundImg;

        return {
            idleFrames: idleData.frames,
            walkFrames: walkData.frames,
            jumpFrames: jumpData.frames,
            fallFrames: fallData.frames,
            landFrames: landData.frames,
            attackFrames: attackData.frames,
            slashFrame: slashImg,
            frameSizes: {
                idle: { w: idleData.frameWidth, h: idleData.frameHeight },
                walk: { w: walkData.frameWidth, h: walkData.frameHeight },
                jump: { w: jumpData.frameWidth, h: jumpData.frameHeight },
                fall: { w: fallData.frameWidth, h: fallData.frameHeight },
                land: { w: landData.frameWidth, h: landData.frameHeight },
                attack: { w: attackData.frameWidth, h: attackData.frameHeight },
            }
        };
    }

    // 初始化
    function init(assets) {
        input = new InputHandler();
        player = new Player(canvas.width, canvas.height, assets);
        
        // 游戏开局状态
        player.y = canvas.height - 500;
        player.velocityY = 0;
        player.setState(states.FALL);
        
        gameLoop();
    }

    // 游戏循环
    function gameLoop() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 绘制背景
        if (bg) {
            ctx.drawImage(bg, 0, 0, canvas.width, canvas.height);
        }

        // 更新和绘制玩家
        player.update(input);
        player.draw(ctx);
        
        input.consumeActionKeys();
        requestAnimationFrame(gameLoop);
    }
    
    // 启动游戏
    loadAssets().then(assets => {
        init(assets);
    });

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if(player){
            player.canvasWidth = canvas.width;
            player.canvasHeight = canvas.height;
        }
    });
});