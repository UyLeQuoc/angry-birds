export const PHYSICS = {
  GRAVITY: -9.82,
  TIME_STEP: 1 / 60,
  MAX_SUB_STEPS: 3,
};

export const GAME_CONFIG = {
  SLINGSHOT_MAX_DISTANCE: 3,
  SLINGSHOT_FORCE_MULTIPLIER: 15,
  BIRD_LAUNCH_DELAY: 0.5,
  MAX_BIRDS_PER_LEVEL: 5,
  CAMERA_FOLLOW_SPEED: 0.05,
  CAMERA_FOLLOW_THRESHOLD: 5,
};

export const MATERIALS = {
  WOOD: { density: 0.6, friction: 0.3, restitution: 0.2 },
  STONE: { density: 2.0, friction: 0.5, restitution: 0.1 },
  GLASS: { density: 0.4, friction: 0.2, restitution: 0.3 },
  BIRD: { density: 1.0, friction: 0.3, restitution: 0.3 },
  PIG: { density: 0.8, friction: 0.4, restitution: 0.2 },
  GROUND: { density: 0, friction: 0.5, restitution: 0.1 },
};

export const BLOCK_TYPES = {
  WOOD_SMALL: { width: 0.5, height: 1, depth: 0.5, material: 'WOOD', hp: 3 },
  WOOD_MEDIUM: { width: 1, height: 1, depth: 0.5, material: 'WOOD', hp: 5 },
  WOOD_LARGE: { width: 2, height: 0.5, depth: 0.5, material: 'WOOD', hp: 7 },
  STONE_SMALL: { width: 0.5, height: 1, depth: 0.5, material: 'STONE', hp: 10 },
  STONE_MEDIUM: { width: 1, height: 1, depth: 0.5, material: 'STONE', hp: 15 },
  STONE_LARGE: { width: 2, height: 0.5, depth: 0.5, material: 'STONE', hp: 20 },
  GLASS_SMALL: { width: 0.5, height: 1, depth: 0.5, material: 'GLASS', hp: 1 },
  GLASS_LARGE: { width: 2, height: 0.5, depth: 0.5, material: 'GLASS', hp: 2 },
};

export const BIRD_TYPES = {
  RED: { 
    name: 'Red', 
    color: 0xff4444, 
    radius: 0.3, 
    ability: null,
    description: 'Classic bird'
  },
  BLUE: { 
    name: 'Blue', 
    color: 0x4444ff, 
    radius: 0.25, 
    ability: 'split',
    description: 'Splits into 3'
  },
  BOMB: { 
    name: 'Bomb', 
    color: 0x222222, 
    radius: 0.4, 
    ability: 'explode',
    description: 'Explodes on impact'
  },
};

export const UI_STATES = {
  LOADING: 'loading',
  MAIN_MENU: 'main_menu',
  LEVEL_SELECT: 'level_select',
  CUTSCENE: 'cutscene',
  PLAYING: 'playing',
  PAUSED: 'paused',
  WIN: 'win',
  LOSE: 'lose',
};

export const COLORS = {
  SKY_TOP: 0x87CEEB,
  SKY_BOTTOM: 0xE0F6FF,
  GROUND: 0x8B7355,
  WOOD: 0xD2691E,
  STONE: 0x808080,
  GLASS: 0xADD8E6,
  PIG: 0x90EE90,
  TRAJECTORY: 0xFFFFFF,
};

export const SCORING = {
  PIG_DEFEATED: 5000,
  BLOCK_DESTROYED: 100,
  BIRD_REMAINING: 10000,
  TIME_BONUS_PER_SECOND: 100,
  THREE_STAR_THRESHOLD: 50000,
  TWO_STAR_THRESHOLD: 30000,
  ONE_STAR_THRESHOLD: 10000,
};

