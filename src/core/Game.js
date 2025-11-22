import * as CANNON from 'cannon-es';
import { SceneManager } from '../rendering/SceneManager.js';
import { PhysicsWorld } from '../physics/PhysicsWorld.js';
import { PhysicsBody } from '../physics/PhysicsBody.js';
import { AssetLoader } from '../utils/AssetLoader.js';
import { UIManager } from '../ui/UIManager.js';
import { InputManager } from '../input/InputManager.js';
import { ParticleSystem } from '../rendering/ParticleSystem.js';
import { CutsceneManager } from '../cutscenes/CutsceneManager.js';
import { LevelManager } from '../levels/LevelManager.js';
import { TrajectoryLine } from '../rendering/TrajectoryLine.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { eventBus } from '../utils/EventBus.js';
import { UI_STATES, GAME_CONFIG, SCORING } from '../utils/Constants.js';

// Entities
import { Bird } from '../entities/Bird.js';
import { Pig } from '../entities/Pig.js';
import { Block } from '../entities/Block.js';
import { Ground } from '../entities/Ground.js';
import { Slingshot } from '../entities/Slingshot.js';

export class Game {
  constructor() {
    this.sceneManager = null;
    this.physicsWorld = null;
    this.assetLoader = null;
    this.uiManager = null;
    this.inputManager = null;
    this.particleSystem = null;
    this.cutsceneManager = null;
    this.levelManager = null;
    this.trajectoryLine = null;
    this.performanceMonitor = null;
    
    this.isRunning = false;
    this.isPaused = false;
    this.lastTime = 0;
    this.gameTime = 0;
    
    // Game state
    this.currentLevel = null;
    this.birds = [];
    this.pigs = [];
    this.blocks = [];
    this.ground = null;
    this.slingshot = null;
    this.currentBird = null;
    this.birdsUsed = 0;
    this.score = 0;
    this.levelStartTime = 0;
    this.loadingNextBird = false;
    this.levelCompleting = false;
    
    // Camera follow
    this.cameraTarget = null;
    this.cameraFollowing = false;
    
    this.setupEventListeners();
  }

  async init() {
    try {
      // Initialize core systems
      this.sceneManager = new SceneManager();
      this.physicsWorld = new PhysicsWorld();
      this.assetLoader = new AssetLoader();
      this.uiManager = new UIManager();
      this.levelManager = new LevelManager();
      
      // Load assets
      await this.assetLoader.loadAssets();
      
      // Initialize remaining systems
      const canvas = document.getElementById('game-canvas');
      
      if (!canvas) {
        throw new Error('Canvas element not found!');
      }
      
      this.inputManager = new InputManager(
        this.sceneManager.getCamera(),
        canvas
      );
      
      
      this.particleSystem = new ParticleSystem(this.sceneManager.getScene());
      this.trajectoryLine = new TrajectoryLine(this.sceneManager.getScene());
      this.cutsceneManager = new CutsceneManager(
        this.sceneManager.getCamera(),
        this.sceneManager.getScene()
      );
      
      // Initialize performance monitor (enable for debugging)
      this.performanceMonitor = new PerformanceMonitor();
      // Uncomment to show FPS counter:
      // this.performanceMonitor.enable(true);
      
      // Setup input handlers
      this.setupInputHandlers();
      
      // Hide loading screen
      this.uiManager.hideLoading();
      
      // Start game loop
      this.isRunning = true;
      this.gameLoop(0);
      
      // Show main menu
      await this.cutsceneManager.playOpeningCutscene();
      this.uiManager.setState(UI_STATES.MAIN_MENU);
      
    } catch (error) {
      console.error('Failed to initialize game:', error);
    }
  }

  setupEventListeners() {
    eventBus.on('ui:mainMenu', () => this.showMainMenu());
    eventBus.on('ui:levelSelect', () => this.showLevelSelect());
    eventBus.on('ui:startLevel', (levelNumber) => this.startLevel(levelNumber));
    eventBus.on('game:pause', () => this.pauseGame());
    eventBus.on('game:resume', () => this.resumeGame());
    eventBus.on('game:restart', () => this.restartLevel());
    eventBus.on('game:nextLevel', () => this.loadNextLevel());
  }

  setupInputHandlers() {
    this.inputManager.on('dragStart', (worldPos) => {
      if (this.isPaused) return;
      if (!this.slingshot) return;
      if (!this.currentBird) return;
      
      // Prevent dragging if bird already launched
      if (this.currentBird.isLaunched) return;
      
      // Prevent dragging if loading next bird
      if (this.loadingNextBird) return;
      
      // Check if near slingshot (increased radius for easier grabbing)
      const distance = Math.sqrt(
        Math.pow(worldPos.x - this.slingshot.position.x, 2) +
        Math.pow(worldPos.y - (this.slingshot.position.y + 1), 2)
      );
      
      if (distance < 3) {  // Increased from 2 to 3 for easier grabbing
        this.slingshot.startDrag();
      }
    });
    
    this.inputManager.on('drag', (worldPos) => {
      if (this.isPaused) return;
      
      if (this.slingshot && this.slingshot.isDragging) {
        this.slingshot.updateDrag(worldPos);
        
        // Update trajectory
        const trajectoryPoints = this.slingshot.calculateTrajectory();
        this.trajectoryLine.update(trajectoryPoints);
      }
    });
    
    this.inputManager.on('dragEnd', (worldPos) => {
      if (this.isPaused) return;
      if (!this.slingshot) return;
      
      const result = this.slingshot.endDrag();
      if (result) {
        this.launchBird(result.bird, result.velocity);
        this.trajectoryLine.hide();
      }
    });
    
    // Click/tap to activate bird ability while in flight
    this.inputManager.on('click', (worldPos) => {
      if (this.isPaused) return;
      
      // Don't activate ability if near slingshot (to prevent accidental activation on launch)
      if (this.slingshot) {
        const distance = Math.sqrt(
          Math.pow(worldPos.x - this.slingshot.position.x, 2) +
          Math.pow(worldPos.y - (this.slingshot.position.y + 1), 2)
        );
        
        // If clicking near slingshot, don't activate ability
        if (distance < 5) return;
      }
      
      // Find active flying bird
      const activeBird = this.birds.find(b => b.isLaunched && b.isActive && !b.abilityUsed);
      if (activeBird) {
        this.activateBirdAbility(activeBird);
      }
    });
  }

  async showMainMenu() {
    this.isPaused = true;
    this.clearLevel();
    this.uiManager.setState(UI_STATES.MAIN_MENU);
  }

  showLevelSelect() {
    this.uiManager.setState(UI_STATES.LEVEL_SELECT);
  }

  async startLevel(levelNumber) {
    const levelData = this.levelManager.getLevel(levelNumber);
    if (!levelData) {
      console.error('Level not found:', levelNumber);
      return;
    }
    
    this.currentLevel = levelData;
    this.isPaused = false;
    
    // Play level start cutscene
    await this.cutsceneManager.playLevelStartCutscene(levelData);
    
    // Load level
    this.loadLevel(levelData);
    
    // Show HUD
    this.uiManager.setState(UI_STATES.PLAYING, {
      level: levelNumber,
      score: this.score,
      birdsRemaining: this.birds.filter(b => !b.isLaunched),
    });
    
    this.levelStartTime = this.gameTime;
  }

  loadLevel(levelData) {
    // Clear previous level
    this.clearLevel();
    
    // Reset score and flags
    this.score = 0;
    this.birdsUsed = 0;
    this.loadingNextBird = false;
    this.levelCompleting = false;
    
    // Create ground
    this.ground = new Ground(this.assetLoader);
    this.sceneManager.add(this.ground.mesh);
    this.physicsWorld.addBody('ground', this.ground.body, 'GROUND');
    
    // Create slingshot
    const slingshotPos = levelData.slingshotPosition || { x: -8, y: 0, z: 0 };
    this.slingshot = new Slingshot(slingshotPos);
    this.sceneManager.add(this.slingshot.mesh);
    
    // Create birds (hide them initially, they'll be shown when loaded into slingshot)
    this.birds = [];
    levelData.birds.forEach((birdData, index) => {
      const bird = new Bird(birdData.type, birdData.position);
      // Hide bird initially - will be shown when loaded into slingshot
      bird.mesh.visible = false;
      // Put bird to sleep to prevent physics affecting hidden birds
      bird.body.sleep();
      this.birds.push(bird);
      this.sceneManager.add(bird.mesh);
      this.physicsWorld.addBody(bird.id, bird.body, 'BIRD');
    });
    
    // Load first bird
    if (this.birds.length > 0) {
      this.loadNextBird();
    }
    
    // Create pigs
    this.pigs = [];
    levelData.pigs.forEach((pigData) => {
      const pig = new Pig(pigData.position, pigData.size, this.sceneManager.getScene());
      this.pigs.push(pig);
      this.sceneManager.add(pig.mesh);
      this.physicsWorld.addBody(pig.id, pig.body, 'PIG');
    });
    
    // Create structures
    this.blocks = [];
    levelData.structures.forEach((structureData) => {
      const block = new Block(
        structureData.type,
        structureData.position,
        this.assetLoader,
        this.sceneManager.getScene()
      );
      this.blocks.push(block);
      this.sceneManager.add(block.mesh);
      this.physicsWorld.addBody(block.id, block.body, block.config.material);
    });
    
    // Set camera position
    if (levelData.cameraPosition) {
      const cam = this.sceneManager.getCamera();
      cam.position.set(
        levelData.cameraPosition.x,
        levelData.cameraPosition.y,
        levelData.cameraPosition.z
      );
      cam.lookAt(0, 3, 0);
    }
  }

  clearLevel() {
    // Remove all entities
    [...this.birds, ...this.pigs, ...this.blocks].forEach(entity => {
      if (entity.mesh) {
        this.sceneManager.remove(entity.mesh);
      }
      if (entity.id) {
        this.physicsWorld.removeBody(entity.id);
      }
      entity.dispose();
    });
    
    if (this.ground) {
      this.sceneManager.remove(this.ground.mesh);
      this.physicsWorld.removeBody('ground');
      this.ground.dispose();
    }
    
    if (this.slingshot) {
      this.sceneManager.remove(this.slingshot.mesh);
      this.slingshot.dispose();
    }
    
    this.birds = [];
    this.pigs = [];
    this.blocks = [];
    this.ground = null;
    this.slingshot = null;
    this.currentBird = null;
    this.cameraFollowing = false;
    this.cameraTarget = null;
    
    this.trajectoryLine.hide();
  }

  loadNextBird() {
    // Prevent loading if already loading or launching
    if (this.loadingNextBird || this.isLaunchingBird) {
      return;
    }
    
    // Prevent loading if slingshot already has a bird
    if (this.slingshot && this.slingshot.currentBird) {
      return;
    }
    
    const nextBird = this.birds.find(b => !b.isLaunched);
    if (nextBird) {
      this.currentBird = nextBird;
      this.slingshot.loadBird(nextBird);
      this.cameraFollowing = false;
      this.cameraTarget = null;
    } else {
      this.currentBird = null;
    }
  }

  launchBird(bird, velocity) {
    if (!bird) return;
    
    // Prevent loading next bird immediately
    this.isLaunchingBird = true;
    
    bird.launch(velocity);
    this.birdsUsed++;
    this.currentBird = null;
    
    // Follow bird with camera
    this.cameraTarget = bird;
    this.cameraFollowing = true;
    
    // Create trail particles
    this.createBirdTrail(bird);
    
    // Allow loading next bird after a very short delay (just to prevent immediate double-click)
    setTimeout(() => {
      this.isLaunchingBird = false;
    }, 300);  // Reduced from 1000ms to 300ms
  }

  createBirdTrail(bird) {
    const trailInterval = setInterval(() => {
      if (!bird.isActive || bird.isAsleep()) {
        clearInterval(trailInterval);
        return;
      }
      
      this.particleSystem.createTrail(
        bird.mesh.position,
        bird.config.color
      );
    }, 100);
  }

  activateBirdAbility(bird) {
    const abilityResult = bird.useAbility();
    
    if (!abilityResult) return;
    
    
    switch (abilityResult.type) {
      case 'split':
        // Blue bird - split into 3
        this.splitBird(bird, abilityResult.count, abilityResult.spread);
        break;
        
      case 'explode':
        // Bomb bird - explode
        this.explodeBird(bird, abilityResult.radius, abilityResult.force);
        break;
        
      case 'boost':
        // Yellow bird - already boosted in useAbility()
        // Just add visual feedback
        this.particleSystem.createExplosion(bird.mesh.position, 0xFFFF00, 12); // Reduced from 20
        break;
    }
  }

  splitBird(originalBird, count, spread) {
    const pos = originalBird.mesh.position.clone();
    const vel = originalBird.body.velocity.clone();
    
    // Create split birds
    for (let i = 0; i < count; i++) {
      const angle = (i - 1) * spread * (Math.PI / 180);
      const splitVel = vel.clone();
      
      // Rotate velocity
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      splitVel.x = vel.x * cos - vel.y * sin;
      splitVel.y = vel.x * sin + vel.y * cos;
      
      // Create mini bird (smaller version)
      const miniBird = new Bird('BLUE', pos);
      miniBird.mesh.scale.set(0.7, 0.7, 0.7);
      miniBird.body.mass = 0.5;
      miniBird.body.updateMassProperties();
      miniBird.body.velocity.copy(splitVel);
      miniBird.isLaunched = true;
      miniBird.isActive = true;
      miniBird.abilityUsed = true;
      
      this.sceneManager.add(miniBird.mesh);
      this.physicsWorld.addBody(miniBird.id, miniBird.body, 'BIRD');
      this.birds.push(miniBird);
    }
    
    // Hide original bird
    originalBird.mesh.visible = false;
    originalBird.isActive = false;
    
    // Visual effect
    this.particleSystem.createExplosion(pos, 0x6495ED, 10); // Reduced from 15
  }

  explodeBird(bird, radius, force) {
    const pos = bird.mesh.position;
    
    // Create massive explosion effect
    this.particleSystem.createExplosion(pos, 0xFF4500, 30); // Reduced from 50
    
    // Apply force to nearby objects
    const explodePos = new CANNON.Vec3(pos.x, pos.y, pos.z);
    
    // Affect blocks
    this.blocks.forEach(block => {
      const blockPos = block.body.position;
      const distance = blockPos.distanceTo(explodePos);
      
      if (distance < radius) {
        const direction = blockPos.vsub(explodePos).unit();
        const forceMagnitude = force * (1 - distance / radius);
        block.body.applyImpulse(
          direction.scale(forceMagnitude),
          blockPos
        );
        // Deal damage
        block.takeDamage(30);
      }
    });
    
    // Affect pigs
    this.pigs.forEach(pig => {
      const pigPos = pig.body.position;
      const distance = pigPos.distanceTo(explodePos);
      
      if (distance < radius) {
        const direction = pigPos.vsub(explodePos).unit();
        const forceMagnitude = force * (1 - distance / radius);
        pig.body.applyImpulse(
          direction.scale(forceMagnitude),
          pigPos
        );
        // Deal damage
        pig.takeDamage(50);
      }
    });
    
    // Deactivate bomb bird
    bird.isActive = false;
    bird.mesh.visible = false;
  }

  checkLevelComplete() {
    // Check if all pigs are defeated
    const allPigsDefeated = this.pigs.every(pig => pig.isDefeated);
    
    if (allPigsDefeated && !this.levelCompleting) {
      this.levelCompleting = true;
      setTimeout(() => this.winLevel(), 1000);
      return true;
    }
    
    // Don't check for next bird if already loading one
    if (this.loadingNextBird || this.isLaunchingBird) {
      return false;
    }
    
    // Check active bird
    const activeBird = this.birds.find(b => b.isLaunched && b.isActive);
    
    if (activeBird) {
      // Check if bird is out of bounds (fell off screen)
      const isOutOfBounds = 
        activeBird.body.position.y < -5 || // Fell down
        Math.abs(activeBird.body.position.x) > 30 || // Too far left/right
        Math.abs(activeBird.body.position.y) > 20; // Too far up
      
      // Check if bird stopped moving (asleep or very slow)
      const isStopped = 
        activeBird.isAsleep() || 
        (activeBird.body.velocity.length() < 0.5 && activeBird.body.position.y < 0.5);
      
      if (isOutOfBounds || isStopped) {
        this.loadingNextBird = true;
        
        // Mark bird as inactive immediately to prevent re-triggering
        activeBird.isActive = false;
        
        // Visual feedback if out of bounds
        if (isOutOfBounds && activeBird.mesh) {
          // Fade out bird that's out of bounds
          const fadeOut = setInterval(() => {
            if (activeBird.mesh) {
              activeBird.mesh.traverse((child) => {
                if (child.material) {
                  child.material.transparent = true;
                  child.material.opacity = Math.max(0, child.material.opacity - 0.1);
                }
              });
            }
          }, 50);
          
          setTimeout(() => clearInterval(fadeOut), 500);
        }
        
        // Load next bird
        const hasMoreBirds = this.birds.some(b => !b.isLaunched);
        if (hasMoreBirds) {
          // Quick load if out of bounds, normal delay if stopped
          const delay = isOutOfBounds ? 500 : 1500;
          
          setTimeout(() => {
            // Reset flag BEFORE calling loadNextBird
            this.loadingNextBird = false;
            
            // Now load the next bird
            this.loadNextBird();
            
            this.uiManager.updateBirdsRemaining(this.birds.filter(b => !b.isLaunched));
            
            // Pan camera back to slingshot
            this.cameraFollowing = false;
            this.panCameraToSlingshot();
          }, delay);
        } else {
          this.loadingNextBird = false;
          // No more birds and pigs still alive = lose
          if (!allPigsDefeated && !this.levelCompleting) {
            this.levelCompleting = true;
            setTimeout(() => this.loseLevel(), 1000);
          }
        }
        return true;
      }
    }
    
    return false;
  }

  async winLevel() {
    this.isPaused = true;
    
    // Calculate score
    const timeBonus = Math.max(0, 60 - (this.gameTime - this.levelStartTime)) * SCORING.TIME_BONUS_PER_SECOND;
    const birdsBonus = (this.birds.length - this.birdsUsed) * SCORING.BIRD_REMAINING;
    this.score += Math.floor(timeBonus + birdsBonus);
    
    // Calculate stars
    let stars = 1;
    if (this.score >= SCORING.THREE_STAR_THRESHOLD) stars = 3;
    else if (this.score >= SCORING.TWO_STAR_THRESHOLD) stars = 2;
    
    // Play win cutscene
    await this.cutsceneManager.playWinCutscene();
    
    // Show win screen
    this.uiManager.setState(UI_STATES.WIN, {
      score: this.score,
      stars: stars,
      isLastLevel: !this.levelManager.hasNextLevel(),
    });
    
    // Trigger star particles
    for (let i = 0; i < stars; i++) {
      setTimeout(() => {
        this.particleSystem.createStarBurst({ x: 0, y: 5, z: 0 });
      }, i * 500);
    }
  }

  async loseLevel() {
    this.isPaused = true;
    
    // Play lose cutscene
    await this.cutsceneManager.playLoseCutscene();
    
    // Show lose screen
    this.uiManager.setState(UI_STATES.LOSE);
  }

  restartLevel() {
    if (this.currentLevel) {
      this.startLevel(this.currentLevel.levelNumber);
    }
  }

  loadNextLevel() {
    const nextLevel = this.levelManager.getNextLevel();
    if (nextLevel) {
      this.startLevel(nextLevel.levelNumber);
    } else {
      this.showMainMenu();
    }
  }

  pauseGame() {
    this.isPaused = true;
    this.uiManager.setState(UI_STATES.PAUSED);
  }

  resumeGame() {
    this.isPaused = false;
    this.uiManager.setState(UI_STATES.PLAYING, {
      level: this.currentLevel?.levelNumber,
      score: this.score,
      birdsRemaining: this.birds.filter(b => !b.isLaunched),
    });
  }

  updateCamera(deltaTime) {
    if (this.cameraFollowing && this.cameraTarget) {
      const camera = this.sceneManager.getCamera();
      const targetPos = this.cameraTarget.mesh.position;
      
      // Smooth follow
      const distance = targetPos.distanceTo(camera.position);
      if (distance > GAME_CONFIG.CAMERA_FOLLOW_THRESHOLD) {
        camera.position.x += (targetPos.x - camera.position.x) * GAME_CONFIG.CAMERA_FOLLOW_SPEED;
        camera.position.y += (targetPos.y + 3 - camera.position.y) * GAME_CONFIG.CAMERA_FOLLOW_SPEED;
      }
      
      // Update parallax
      this.sceneManager.updateParallax(camera.position.x);
      
      // Stop following if bird stopped
      if (this.cameraTarget.isAsleep()) {
        this.cameraFollowing = false;
        // Pan back to slingshot
        this.panCameraToSlingshot();
      }
    }
  }

  panCameraToSlingshot() {
    const camera = this.sceneManager.getCamera();
    const targetPos = this.currentLevel.cameraPosition;
    
    const duration = 1;
    const startPos = { x: camera.position.x, y: camera.position.y };
    const startTime = this.gameTime;
    
    const animate = () => {
      const elapsed = this.gameTime - startTime;
      const t = Math.min(elapsed / duration, 1);
      
      camera.position.x = startPos.x + (targetPos.x - startPos.x) * t;
      camera.position.y = startPos.y + (targetPos.y - startPos.y) * t;
      
      this.sceneManager.updateParallax(camera.position.x);
      
      if (t < 1) {
        setTimeout(animate, 16);
      }
    };
    
    animate();
  }

  update(deltaTime) {
    if (this.isPaused) return;
    
    // Update physics
    this.physicsWorld.update(deltaTime);
    
    // Check level completion continuously
    if (this.currentLevel && !this.levelCompleting) {
      this.checkLevelComplete();
    }
    
    // Update entities
    this.birds.forEach(bird => {
      bird.update(deltaTime);
    });
    this.pigs.forEach(pig => {
      pig.update(deltaTime);
      
      // Check if defeated and create explosion
      if (pig.isDefeated && !pig.exploded) {
        pig.exploded = true;
        this.particleSystem.createExplosion(pig.mesh.position, 0x90EE90, 18); // Reduced count
        this.score += SCORING.PIG_DEFEATED;
        this.uiManager.updateScore(this.score);
        
        // Remove from scene
        setTimeout(() => {
          this.sceneManager.remove(pig.mesh);
          this.physicsWorld.removeBody(pig.id);
        }, 100);
      }
    });
    
    this.blocks.forEach(block => {
      block.update(deltaTime);
      
      // Check if destroyed and create explosion
      if (block.isDestroyed && !block.exploded) {
        block.exploded = true;
        this.particleSystem.createExplosion(block.mesh.position, 0xFFAA00, 10); // Reduced from 15
        this.score += SCORING.BLOCK_DESTROYED;
        this.uiManager.updateScore(this.score);
        
        // Remove from scene
        setTimeout(() => {
          this.sceneManager.remove(block.mesh);
          this.physicsWorld.removeBody(block.id);
        }, 100);
      }
    });
    
    // Update particles
    this.particleSystem.update(deltaTime);
    
    // Update camera
    this.updateCamera(deltaTime);
  }

  gameLoop(time) {
    if (!this.isRunning) return;
    
    const deltaTime = Math.min((time - this.lastTime) / 1000, 0.1);
    this.lastTime = time;
    this.gameTime += deltaTime;
    
    // Update performance monitor
    if (this.performanceMonitor) {
      this.performanceMonitor.update();
    }
    
    // Update game
    this.update(deltaTime);
    
    // Update scene
    this.sceneManager.update(deltaTime, this.gameTime);
    
    // Render
    this.sceneManager.render();
    
    // Next frame
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  dispose() {
    this.isRunning = false;
    this.clearLevel();
    
    if (this.sceneManager) this.sceneManager.dispose();
    if (this.physicsWorld) this.physicsWorld.dispose();
    if (this.assetLoader) this.assetLoader.dispose();
    if (this.inputManager) this.inputManager.dispose();
    if (this.particleSystem) this.particleSystem.clear();
    if (this.trajectoryLine) this.trajectoryLine.dispose();
    if (this.cutsceneManager) this.cutsceneManager.dispose();
    
    eventBus.clear();
  }
}

