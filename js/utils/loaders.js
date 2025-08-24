export function loadSpriteSheet(path, frameCount) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => {
            const frameWidth = img.width / frameCount;
            const frameHeight = img.height;
            const frames = [];
            for (let i = 0; i < frameCount; i++) {
                const canvas = document.createElement('canvas');
                canvas.width = frameWidth;
                canvas.height = frameHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, i * frameWidth, 0, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);
                frames.push(canvas);
            }
            resolve({ frames, frameWidth, frameHeight });
        };
        img.onerror = () => reject(new Error(`Failed to load sprite sheet: ${path}`));
    });
}

export function loadImage(path) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = path;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
    });
}

export function loadJSON(path) {
    return fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load JSON: ${path}, status: ${response.status}`);
            }
            return response.json();
        });
}