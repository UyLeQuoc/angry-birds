import { Level1 } from './Level1.js';
import { Level2 } from './Level2.js';
import { Level3 } from './Level3.js';
import { Level4 } from './Level4.js';
import { Level5 } from './Level5.js';

export class LevelManager {
  constructor() {
    this.levels = [
      Level1,
      Level2,
      Level3,
      Level4,
      Level5,
    ];
    
    this.currentLevelIndex = -1;
    this.currentLevelData = null;
  }

  getLevel(levelNumber) {
    const index = levelNumber - 1;
    if (index >= 0 && index < this.levels.length) {
      this.currentLevelIndex = index;
      this.currentLevelData = this.levels[index];
      return this.currentLevelData;
    }
    return null;
  }

  getCurrentLevel() {
    return this.currentLevelData;
  }

  getNextLevel() {
    const nextIndex = this.currentLevelIndex + 1;
    if (nextIndex < this.levels.length) {
      return this.getLevel(nextIndex + 1);
    }
    return null;
  }

  hasNextLevel() {
    return this.currentLevelIndex + 1 < this.levels.length;
  }

  getTotalLevels() {
    return this.levels.length;
  }
}

