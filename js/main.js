import { Game } from './core/Game.js';

window.addEventListener('load', () =>{
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error("Canvas element not found!");
        return;
    }
    const game = new Game(canvas);
    game.start();
})