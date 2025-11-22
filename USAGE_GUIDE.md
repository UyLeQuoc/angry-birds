# 🎮 Vibe Angry Birds - Complete Usage Guide

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The game will open automatically at `http://localhost:3000`

## Game Controls

### Desktop
- **Click & Drag**: Pull back the slingshot to aim
- **Release**: Launch the bird
- **Click**: Skip cutscenes
- **Pause Button** (top right): Pause the game

### Mobile/Touch
- **Touch & Drag**: Pull back the slingshot to aim
- **Release**: Launch the bird
- **Tap**: Skip cutscenes

## Gameplay Tips

### 1. Aiming
- The white dotted line shows your trajectory
- Pull further back for more power
- Aim for weak spots in structures

### 2. Material Properties
- **Glass** 🔷: Very fragile, breaks easily
- **Wood** 🟫: Medium strength, good for most shots
- **Stone** ⬛: Very strong, requires direct hits or explosions

### 3. Bird Types
- **Red Bird** 🔴: Standard bird, good all-around
- **Blue Bird** 🔵: Lighter, good for glass structures
- **Bomb Bird** ⚫: Heavy, creates explosions

### 4. Scoring
- **Destroy pigs**: 5,000 points each
- **Break blocks**: 100 points each
- **Remaining birds**: 10,000 points each
- **Time bonus**: 100 points per second under 60 seconds

### 5. Star Ratings
- ⭐ 1 Star: 10,000+ points
- ⭐⭐ 2 Stars: 30,000+ points
- ⭐⭐⭐ 3 Stars: 50,000+ points

## Level Guide

### Level 1: Getting Started
**Objective**: Learn the basics
- Simple wooden tower
- 1 pig to defeat
- 3 red birds available

**Strategy**: Aim for the base of the structure to make it collapse

### Level 2: Glass Castle
**Objective**: Learn about glass
- Fragile glass structure
- 2 pigs to defeat
- Mix of red and blue birds

**Strategy**: Glass breaks easily, aim directly at supporting columns

### Level 3: The Fortress
**Objective**: Deal with stone
- Stone fortress with wooden top
- 2 pigs (one on top, one on side)
- Includes bomb bird for heavy destruction

**Strategy**: Use bomb bird for stone walls, save red birds for wooden parts

### Level 4: Pig Palace
**Objective**: Multi-tower challenge
- 3 connected towers
- 3 pigs spread across structure
- Varied bird types

**Strategy**: Aim for connections between towers to create chain reactions

### Level 5: Final Showdown
**Objective**: Master all techniques
- Massive fortress with all materials
- 4 pigs including a "boss pig"
- 5 birds total

**Strategy**: Start with weak points, save bomb bird for stone sections

## Advanced Techniques

### 1. Trajectory Planning
- The trajectory line helps you plan shots
- Account for gravity - birds will arc downward
- Aim slightly above targets for distant shots

### 2. Chain Reactions
- Destroy supporting blocks first
- Use falling debris to your advantage
- One well-placed shot can destroy multiple structures

### 3. Material Targeting
- Glass: Direct light hits
- Wood: Medium to strong hits
- Stone: Very strong hits or bomb birds

### 4. Physics Exploitation
- Blocks falling on pigs count as defeats
- Heavier blocks cause more damage when falling
- Rolling blocks can knock over structures

## Architecture Overview

### Core Systems

#### Game Loop
Located in `src/core/Game.js`
- Runs at 60 FPS (or monitor refresh rate)
- Updates physics, entities, particles, and camera
- Handles game state transitions

#### Physics System
Located in `src/physics/`
- Uses Cannon-es physics engine
- Handles collisions, gravity, and forces
- Optimized with sleep states for inactive objects

#### Rendering System
Located in `src/rendering/`
- Three.js for 3D graphics
- Custom shaders for sky and particles
- Shadow mapping for realistic lighting
- Parallax scrolling background

#### Input System
Located in `src/input/`
- Unified mouse and touch handling
- Raycasting for 3D world interaction
- Drag and drop mechanics for slingshot

#### UI System
Located in `src/ui/`
- HTML overlay for menus and HUD
- GSAP animations for smooth transitions
- Responsive design for all screen sizes

## Customization Guide

### Adding New Levels

1. Create a new level file in `src/levels/`:

```javascript
// src/levels/Level6.js
export const Level6 = {
  levelNumber: 6,
  name: 'My Custom Level',
  birds: [
    { type: 'RED', position: { x: -8, y: 1, z: 0 } },
    { type: 'BLUE', position: { x: -10, y: 0.5, z: 0 } },
  ],
  pigs: [
    { position: { x: 8, y: 0.6, z: 0 }, size: 0.4 },
  ],
  structures: [
    { type: 'WOOD_LARGE', position: { x: 8, y: 1.25, z: 0 } },
    { type: 'STONE_SMALL', position: { x: 7, y: 0.5, z: 0 } },
  ],
  slingshotPosition: { x: -8, y: 0, z: 0 },
  cameraPosition: { x: 0, y: 5, z: 15 },
};
```

2. Import it in `src/levels/LevelManager.js`:

```javascript
import { Level6 } from './Level6.js';

// Add to levels array
this.levels = [
  Level1,
  Level2,
  Level3,
  Level4,
  Level5,
  Level6,  // New level
];
```

### Available Block Types

In `src/utils/Constants.js`:

```javascript
// Wood blocks
WOOD_SMALL: { width: 0.5, height: 1, depth: 0.5, hp: 3 }
WOOD_MEDIUM: { width: 1, height: 1, depth: 0.5, hp: 5 }
WOOD_LARGE: { width: 2, height: 0.5, depth: 0.5, hp: 7 }

// Stone blocks
STONE_SMALL: { width: 0.5, height: 1, depth: 0.5, hp: 10 }
STONE_MEDIUM: { width: 1, height: 1, depth: 0.5, hp: 15 }
STONE_LARGE: { width: 2, height: 0.5, depth: 0.5, hp: 20 }

// Glass blocks
GLASS_SMALL: { width: 0.5, height: 1, depth: 0.5, hp: 1 }
GLASS_LARGE: { width: 2, height: 0.5, depth: 0.5, hp: 2 }
```

### Modifying Game Constants

Edit `src/utils/Constants.js`:

```javascript
// Slingshot physics
SLINGSHOT_MAX_DISTANCE: 3,          // Maximum pull distance
SLINGSHOT_FORCE_MULTIPLIER: 15,     // Launch force

// Camera
CAMERA_FOLLOW_SPEED: 0.05,          // Camera follow smoothness
CAMERA_FOLLOW_THRESHOLD: 5,         // Distance before following

// Scoring
PIG_DEFEATED: 5000,                 // Points per pig
BLOCK_DESTROYED: 100,               // Points per block
BIRD_REMAINING: 10000,              // Bonus per unused bird
```

### Customizing Visuals

#### Changing Colors

Edit `src/utils/Constants.js`:

```javascript
COLORS: {
  SKY_TOP: 0x87CEEB,      // Top of sky gradient
  SKY_BOTTOM: 0xE0F6FF,   // Bottom of sky gradient
  GROUND: 0x8B7355,       // Ground color
  WOOD: 0xD2691E,         // Wood blocks
  STONE: 0x808080,        // Stone blocks
  GLASS: 0xADD8E6,        // Glass blocks
}
```

#### Modifying Shaders

Edit shader files in `src/shaders/`:

- `sky.vert` / `sky.frag`: Animated sky background
- `particle.vert` / `particle.frag`: Particle effects

### Performance Tuning

#### Enable FPS Counter

In `src/core/Game.js`, uncomment:

```javascript
this.performanceMonitor.enable(true);
```

#### Adjust Physics Quality

In `src/utils/Constants.js`:

```javascript
PHYSICS: {
  GRAVITY: -9.82,        // Gravity strength
  TIME_STEP: 1 / 60,     // Physics update rate
  MAX_SUB_STEPS: 3,      // Physics substeps (higher = more accurate)
}
```

#### Reduce Particle Count

In `src/rendering/ParticleSystem.js`, reduce particle counts:

```javascript
createExplosion(position, color = 0xFFAA00, count = 30) {
  // Change count to lower value for better performance
}
```

## Debugging

### Enable Developer Console

Press F12 in your browser to open developer tools.

### Common Issues

#### Black Screen
- Check browser console for errors
- Ensure WebGL is supported
- Try another browser (Chrome/Firefox recommended)

#### Poor Performance
- Enable FPS counter to monitor performance
- Reduce shadow quality in `src/rendering/SceneManager.js`
- Lower particle counts

#### Physics Issues
- Check physics time step in constants
- Ensure masses are reasonable
- Verify collision shapes match visual meshes

### Performance Stats

Access from browser console:

```javascript
// Current FPS
window.game.performanceMonitor.getFPS()

// Entity counts
window.game.birds.length
window.game.pigs.length
window.game.blocks.length
```

## Browser Compatibility

### Recommended
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- WebGL 2.0 support
- ES6+ JavaScript support
- 1920x1080 minimum resolution (responsive design adapts)

## Performance Targets

- **Desktop**: 60 FPS on mid-range hardware
- **Mobile**: 30-60 FPS on modern devices
- **Memory**: < 200MB RAM usage
- **Load Time**: < 3 seconds on broadband

## Troubleshooting

### Game Won't Start
1. Clear browser cache
2. Check console for errors
3. Verify all dependencies installed
4. Try `npm clean-install`

### Physics Acting Strange
1. Check TIME_STEP in constants
2. Verify mass values are reasonable
3. Ensure collision shapes are correct

### Camera Issues
1. Adjust CAMERA_FOLLOW_SPEED
2. Check camera position in level data
3. Verify lookAt target is correct

## Credits & License

Built with:
- **Three.js**: 3D rendering
- **Cannon-es**: Physics simulation
- **GSAP**: Animation library
- **Vite**: Build tool

Licensed under MIT License.

Made with ❤️ for the Angry Birds community!

