import { Game } from './core/Game.js';
import './utils/polyfills.js';

// Initialize game when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  const game = new Game();
  window.game = game; // For debugging
  game.init();
});

