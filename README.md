# 🐦 Vibe Angry Birds

A fully-featured WebGL Angry Birds clone built with Vite, Three.js, and Cannon-es physics engine.

## 🎮 Features

### Core Gameplay
- **Physics-based slingshot mechanics** with trajectory visualization
- **3 Bird types** with unique abilities:
  - 🔴 Red Bird: Classic bird
  - 🔵 Blue Bird: Splits into 3 birds
  - ⚫ Bomb Bird: Explodes on impact
- **Animated characters** with idle animations, eye blinking, and squash & stretch
- **Destructible structures** made of wood, stone, and glass blocks
- **5 complete levels** with increasing difficulty

### Visual Effects
- **GLSL shaders** for animated sky background with procedural clouds
- **Parallax scrolling** hills for depth
- **Particle systems** for explosions, trails, and star bursts
- **Real-time shadows** and lighting
- **Smooth camera follow** during bird flight

### UI & Polish
- **Cartoon-style UI** matching Angry Birds aesthetic
- **Multiple screens**: Main Menu, Level Select, HUD, Pause Menu, Win/Lose screens
- **Star rating system** (1-3 stars based on score)
- **Animated transitions** using GSAP
- **Scoring system** with bonuses for remaining birds and time

### Cutscenes
- **Opening cutscene** showing the story
- **Level start cutscenes** with camera pans
- **Win/lose cutscenes** with animations
- **Skippable** cutscenes (click/tap to skip)

### Performance Optimizations
- **Instanced rendering** for repeated objects
- **Texture atlases** for materials
- **Optimized physics** with sleep states
- **Efficient particle systems** with automatic cleanup
- **Lazy asset loading**

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 🏗️ Project Structure

```
vibe-angry-bird/
├── src/
│   ├── core/
│   │   └── Game.js              # Main game manager
│   ├── entities/
│   │   ├── Bird.js              # Bird entity with animations
│   │   ├── Pig.js               # Pig enemy entity
│   │   ├── Block.js             # Destructible block entity
│   │   ├── Ground.js            # Ground plane
│   │   └── Slingshot.js         # Slingshot mechanics
│   ├── physics/
│   │   ├── PhysicsWorld.js      # Cannon-es physics wrapper
│   │   └── PhysicsBody.js       # Physics body helpers
│   ├── rendering/
│   │   ├── SceneManager.js      # Three.js scene setup
│   │   ├── ParticleSystem.js    # Particle effects
│   │   └── TrajectoryLine.js    # Trajectory visualization
│   ├── input/
│   │   └── InputManager.js      # Mouse/touch input handling
│   ├── ui/
│   │   └── UIManager.js         # UI screens and HUD
│   ├── cutscenes/
│   │   └── CutsceneManager.js   # Cutscene system
│   ├── levels/
│   │   ├── LevelManager.js      # Level loading
│   │   ├── Level1.js            # Level 1 definition
│   │   ├── Level2.js            # Level 2 definition
│   │   ├── Level3.js            # Level 3 definition
│   │   ├── Level4.js            # Level 4 definition
│   │   └── Level5.js            # Level 5 definition
│   ├── shaders/
│   │   ├── sky.vert             # Sky shader vertex
│   │   ├── sky.frag             # Sky shader fragment
│   │   ├── particle.vert        # Particle shader vertex
│   │   └── particle.frag        # Particle shader fragment
│   ├── utils/
│   │   ├── Constants.js         # Game constants
│   │   ├── EventBus.js          # Event system
│   │   ├── AssetLoader.js       # Asset management
│   │   └── polyfills.js         # Polyfills
│   └── main.js                  # Entry point
├── index.html
├── vite.config.js
├── package.json
└── README.md
```

## 🎯 How to Play

1. **Aim**: Click and drag the bird in the slingshot
2. **Trajectory**: See the dotted line showing where the bird will go
3. **Launch**: Release to fire the bird
4. **Objective**: Destroy all pigs to win the level
5. **Score**: Get 3 stars by using fewer birds and completing faster

### Controls
- **Mouse/Touch**: Drag to aim and release to shoot
- **Click/Tap**: Skip cutscenes
- **Pause Button**: Pause the game

## 🎨 Customization

### Adding New Levels

Create a new level file in `src/levels/`:

```javascript
export const Level6 = {
  levelNumber: 6,
  name: 'Your Level Name',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    { type: 'WOOD_LARGE', position: { x: 8, y: 1.25, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 0, y: 5, z: 15 },
};
```

Then add it to `LevelManager.js`.

### Block Types

Available block types in `Constants.js`:
- `WOOD_SMALL`, `WOOD_MEDIUM`, `WOOD_LARGE`
- `STONE_SMALL`, `STONE_MEDIUM`, `STONE_LARGE`
- `GLASS_SMALL`, `GLASS_LARGE`

### Bird Types

- `RED`: Standard bird
- `BLUE`: Splits into 3 (ability not yet implemented)
- `BOMB`: Explosive bird (ability not yet implemented)

## 🔧 Technical Details

### Technologies Used
- **Vite**: Fast build tool and dev server
- **Three.js**: 3D rendering engine
- **Cannon-es**: Physics simulation
- **GSAP**: Animation library

### Performance Features
- Physics sleep states for inactive objects
- Efficient particle pooling
- Optimized shadow maps
- Procedural textures to reduce memory
- Frustum culling (automatic with Three.js)

## 📝 License

MIT License - Feel free to use this project for learning or commercial purposes.

## 🙏 Credits

Inspired by the original Angry Birds game by Rovio Entertainment.

Built with ❤️ using modern web technologies.

# angry-birds
