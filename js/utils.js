
//加载精灵图并按帧切割
export function loadSpriteSheet(path, frameCount) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            const frameWidth = img.width / frameCount;
            const frameHeight = img.height;
            const frames = [];
            for (let i = 0; i < frameCount; i++) {
                const off = document.createElement('canvas');
                off.width = frameWidth;
                off.height = frameHeight;
                const octx = off.getContext('2d');
                octx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                frames.push(off);
            }
            resolve({ frames, frameWidth, frameHeight });
        };
    });
}

//加载图片
export function loadImage(path) {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            resolve(img);
        };
    });
}