// js/inputHandler.js

class InputHandler {
    constructor() {
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false,
            Attack: false,
        };

        window.addEventListener('keydown', (e) => {
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
     consumeActionKeys() {
        this.keys.Space = false;
        this.keys.Attack = false;
    }
}