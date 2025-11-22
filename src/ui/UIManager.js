import { UI_STATES } from '../utils/Constants.js';
import { eventBus } from '../utils/EventBus.js';
import gsap from 'gsap';

export class UIManager {
  constructor() {
    this.overlay = document.getElementById('ui-overlay');
    this.currentState = UI_STATES.LOADING;
    this.screens = {};
    
    this.initialize();
  }

  initialize() {
    this.createMainMenu();
    this.createLevelSelect();
    this.createHUD();
    this.createPauseMenu();
    this.createWinScreen();
    this.createLoseScreen();
    
    // Hide all screens initially
    Object.values(this.screens).forEach(screen => {
      if (screen.element) {
        screen.element.style.display = 'none';
      }
    });
  }

  createMainMenu() {
    const menu = document.createElement('div');
    menu.className = 'ui-element';
    menu.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: none;
    `;
    
    const title = document.createElement('h1');
    title.textContent = '🐦 VIBE ANGRY BIRDS 🐦';
    title.style.cssText = `
      font-size: 72px;
      color: #FF4444;
      text-shadow: 4px 4px 8px rgba(0,0,0,0.5);
      margin-bottom: 50px;
      animation: bounce 2s infinite;
    `;
    menu.appendChild(title);
    
    const playButton = document.createElement('button');
    playButton.textContent = 'PLAY';
    playButton.className = 'btn';
    playButton.style.cssText = `
      font-size: 48px;
      padding: 20px 60px;
      margin: 10px;
    `;
    playButton.onclick = () => {
      eventBus.emit('ui:levelSelect');
    };
    menu.appendChild(playButton);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    this.overlay.appendChild(menu);
    this.screens.mainMenu = { element: menu };
  }

  createLevelSelect() {
    const screen = document.createElement('div');
    screen.className = 'ui-element';
    screen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: none;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'SELECT LEVEL';
    title.style.cssText = `
      font-size: 48px;
      color: #FF4444;
      text-shadow: 3px 3px 6px rgba(0,0,0,0.5);
      margin-bottom: 30px;
    `;
    screen.appendChild(title);
    
    const levelsContainer = document.createElement('div');
    levelsContainer.style.cssText = `
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
    `;
    
    for (let i = 1; i <= 5; i++) {
      const levelButton = document.createElement('button');
      levelButton.textContent = i;
      levelButton.className = 'btn';
      levelButton.style.cssText = `
        width: 100px;
        height: 100px;
        font-size: 48px;
        border-radius: 50%;
      `;
      levelButton.onclick = () => {
        eventBus.emit('ui:startLevel', i);
      };
      levelsContainer.appendChild(levelButton);
    }
    
    screen.appendChild(levelsContainer);
    
    const backButton = document.createElement('button');
    backButton.textContent = 'BACK';
    backButton.className = 'btn';
    backButton.style.cssText = `
      margin-top: 30px;
      font-size: 24px;
    `;
    backButton.onclick = () => {
      eventBus.emit('ui:mainMenu');
    };
    screen.appendChild(backButton);
    
    this.overlay.appendChild(screen);
    this.screens.levelSelect = { element: screen };
  }

  createHUD() {
    const hud = document.createElement('div');
    hud.className = 'ui-element';
    hud.style.cssText = `
      position: absolute;
      top: 20px;
      left: 0;
      right: 0;
      display: none;
      pointer-events: none;
    `;
    
    // Top bar
    const topBar = document.createElement('div');
    topBar.style.cssText = `
      display: flex;
      justify-content: space-between;
      padding: 0 30px;
      align-items: center;
    `;
    
    // Level info
    const levelInfo = document.createElement('div');
    levelInfo.style.cssText = `
      font-size: 24px;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      font-weight: bold;
    `;
    levelInfo.innerHTML = '<span id="level-number">Level 1</span>';
    topBar.appendChild(levelInfo);
    
    // Score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = `
      font-size: 32px;
      color: #FFD700;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      font-weight: bold;
    `;
    scoreDisplay.innerHTML = 'Score: <span id="score">0</span>';
    topBar.appendChild(scoreDisplay);
    
    // Pause button
    const pauseButton = document.createElement('button');
    pauseButton.textContent = '⏸';
    pauseButton.className = 'btn';
    pauseButton.style.cssText = `
      font-size: 32px;
      padding: 10px 20px;
      pointer-events: auto;
    `;
    pauseButton.onclick = () => {
      eventBus.emit('game:pause');
    };
    topBar.appendChild(pauseButton);
    
    hud.appendChild(topBar);
    
    this.overlay.appendChild(hud);
    this.screens.hud = { element: hud };
    
    // Birds remaining (centered at bottom) - separate from HUD to avoid top positioning
    const birdsContainer = document.createElement('div');
    birdsContainer.id = 'birds-remaining';
    birdsContainer.className = 'ui-element';
    birdsContainer.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: none;
      gap: 12px;
      background: rgba(0, 0, 0, 0.6);
      padding: 12px 24px;
      border-radius: 50px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      backdrop-filter: blur(5px);
      pointer-events: none;
    `;
    this.overlay.appendChild(birdsContainer);
  }

  createPauseMenu() {
    const menu = document.createElement('div');
    menu.className = 'ui-element';
    menu.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: none;
      background: rgba(0, 0, 0, 0.8);
      padding: 50px;
      border-radius: 20px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'PAUSED';
    title.style.cssText = `
      font-size: 48px;
      color: white;
      margin-bottom: 30px;
    `;
    menu.appendChild(title);
    
    const resumeButton = document.createElement('button');
    resumeButton.textContent = 'RESUME';
    resumeButton.className = 'btn';
    resumeButton.style.marginBottom = '10px';
    resumeButton.onclick = () => {
      eventBus.emit('game:resume');
    };
    menu.appendChild(resumeButton);
    
    const restartButton = document.createElement('button');
    restartButton.textContent = 'RESTART';
    restartButton.className = 'btn';
    restartButton.style.marginBottom = '10px';
    restartButton.onclick = () => {
      eventBus.emit('game:restart');
    };
    menu.appendChild(restartButton);
    
    const menuButton = document.createElement('button');
    menuButton.textContent = 'MAIN MENU';
    menuButton.className = 'btn';
    menuButton.onclick = () => {
      eventBus.emit('ui:mainMenu');
    };
    menu.appendChild(menuButton);
    
    this.overlay.appendChild(menu);
    this.screens.pauseMenu = { element: menu };
  }

  createWinScreen() {
    const screen = document.createElement('div');
    screen.className = 'ui-element';
    screen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: none;
      background: rgba(0, 0, 0, 0.9);
      padding: 50px;
      border-radius: 20px;
      min-width: 400px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '🎉 LEVEL COMPLETE! 🎉';
    title.style.cssText = `
      font-size: 42px;
      color: #FFD700;
      margin-bottom: 20px;
    `;
    screen.appendChild(title);
    
    // Stars
    const starsContainer = document.createElement('div');
    starsContainer.id = 'stars-container';
    starsContainer.style.cssText = `
      font-size: 72px;
      margin: 20px 0;
    `;
    screen.appendChild(starsContainer);
    
    // Score
    const scoreDisplay = document.createElement('div');
    scoreDisplay.style.cssText = `
      font-size: 32px;
      color: white;
      margin: 20px 0;
    `;
    scoreDisplay.innerHTML = 'Score: <span id="final-score">0</span>';
    screen.appendChild(scoreDisplay);
    
    // Buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 30px;
    `;
    
    const retryButton = document.createElement('button');
    retryButton.textContent = 'RETRY';
    retryButton.className = 'btn';
    retryButton.onclick = () => {
      eventBus.emit('game:restart');
    };
    buttonsContainer.appendChild(retryButton);
    
    const nextButton = document.createElement('button');
    nextButton.textContent = 'NEXT';
    nextButton.className = 'btn';
    nextButton.id = 'next-level-button';
    nextButton.onclick = () => {
      eventBus.emit('game:nextLevel');
    };
    buttonsContainer.appendChild(nextButton);
    
    screen.appendChild(buttonsContainer);
    
    this.overlay.appendChild(screen);
    this.screens.winScreen = { element: screen };
  }

  createLoseScreen() {
    const screen = document.createElement('div');
    screen.className = 'ui-element';
    screen.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      display: none;
      background: rgba(0, 0, 0, 0.9);
      padding: 50px;
      border-radius: 20px;
    `;
    
    const title = document.createElement('h2');
    title.textContent = '💀 LEVEL FAILED 💀';
    title.style.cssText = `
      font-size: 42px;
      color: #FF4444;
      margin-bottom: 30px;
    `;
    screen.appendChild(title);
    
    const retryButton = document.createElement('button');
    retryButton.textContent = 'RETRY';
    retryButton.className = 'btn';
    retryButton.style.marginBottom = '10px';
    retryButton.onclick = () => {
      eventBus.emit('game:restart');
    };
    screen.appendChild(retryButton);
    
    const menuButton = document.createElement('button');
    menuButton.textContent = 'MAIN MENU';
    menuButton.className = 'btn';
    menuButton.onclick = () => {
      eventBus.emit('ui:mainMenu');
    };
    screen.appendChild(menuButton);
    
    this.overlay.appendChild(screen);
    this.screens.loseScreen = { element: screen };
  }

  setState(state, data = {}) {
    // Hide all screens
    Object.values(this.screens).forEach(screen => {
      if (screen.element) {
        screen.element.style.display = 'none';
      }
    });
    
    // Hide birds container
    const birdsContainer = document.getElementById('birds-remaining');
    if (birdsContainer) {
      birdsContainer.style.display = 'none';
    }
    
    this.currentState = state;
    
    // Show appropriate screen
    switch (state) {
      case UI_STATES.MAIN_MENU:
        this.showMainMenu();
        break;
      case UI_STATES.LEVEL_SELECT:
        this.showLevelSelect();
        break;
      case UI_STATES.PLAYING:
        this.showHUD(data);
        break;
      case UI_STATES.PAUSED:
        this.showPauseMenu();
        break;
      case UI_STATES.WIN:
        this.showWinScreen(data);
        break;
      case UI_STATES.LOSE:
        this.showLoseScreen();
        break;
    }
  }

  showMainMenu() {
    const screen = this.screens.mainMenu.element;
    screen.style.display = 'block';
    
    gsap.from(screen, {
      scale: 0,
      duration: 0.5,
      ease: 'back.out',
    });
  }

  showLevelSelect() {
    const screen = this.screens.levelSelect.element;
    screen.style.display = 'block';
    
    gsap.from(screen, {
      y: -100,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  showHUD(data) {
    const hud = this.screens.hud.element;
    hud.style.display = 'block';
    
    // Show birds container at bottom
    const birdsContainer = document.getElementById('birds-remaining');
    if (birdsContainer) {
      birdsContainer.style.display = 'flex';
    }
    
    if (data.level) {
      document.getElementById('level-number').textContent = `Level ${data.level}`;
    }
    
    this.updateScore(data.score || 0);
    this.updateBirdsRemaining(data.birdsRemaining || 0);
  }

  showPauseMenu() {
    const hud = this.screens.hud.element;
    hud.style.display = 'block';
    
    const menu = this.screens.pauseMenu.element;
    menu.style.display = 'block';
    
    gsap.from(menu, {
      scale: 0,
      duration: 0.3,
      ease: 'back.out',
    });
  }

  showWinScreen(data) {
    const screen = this.screens.winScreen.element;
    screen.style.display = 'block';
    
    // Update score
    document.getElementById('final-score').textContent = data.score || 0;
    
    // Animate stars
    const starsContainer = document.getElementById('stars-container');
    starsContainer.innerHTML = '';
    
    const stars = data.stars || 1;
    for (let i = 0; i < 3; i++) {
      const star = document.createElement('span');
      star.textContent = i < stars ? '⭐' : '☆';
      star.style.display = 'inline-block';
      starsContainer.appendChild(star);
      
      if (i < stars) {
        gsap.from(star, {
          scale: 0,
          rotation: 360,
          duration: 0.5,
          delay: i * 0.2,
          ease: 'back.out',
        });
      }
    }
    
    // Hide next button if last level
    const nextButton = document.getElementById('next-level-button');
    if (data.isLastLevel) {
      nextButton.style.display = 'none';
    } else {
      nextButton.style.display = 'inline-block';
    }
    
    gsap.from(screen, {
      scale: 0,
      duration: 0.5,
      delay: 0.5,
      ease: 'back.out',
    });
  }

  showLoseScreen() {
    const screen = this.screens.loseScreen.element;
    screen.style.display = 'block';
    
    gsap.from(screen, {
      y: 100,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out',
    });
  }

  updateScore(score) {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      gsap.to({ value: parseInt(scoreElement.textContent) || 0 }, {
        value: score,
        duration: 0.5,
        onUpdate: function() {
          scoreElement.textContent = Math.floor(this.targets()[0].value);
        }
      });
    }
  }

  updateBirdsRemaining(birds) {
    const container = document.getElementById('birds-remaining');
    if (container) {
      container.innerHTML = '';
      
      // If birds is a number (backward compat), show generic birds
      if (typeof birds === 'number') {
        for (let i = 0; i < birds; i++) {
          const bird = document.createElement('div');
          bird.textContent = '🐦';
          bird.style.cssText = `
            font-size: 32px;
            filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.5));
          `;
          container.appendChild(bird);
        }
        return;
      }
      
      // If birds is an array, show specific bird types
      if (Array.isArray(birds)) {
        birds.forEach(bird => {
          const birdIcon = document.createElement('div');
          
          // Set icon based on bird type
          let icon = '🐦';
          let bgColor = '#ff6b6b';
          
          switch(bird.type) {
            case 'RED':
              icon = '🔴';
              bgColor = '#ff6b6b';
              break;
            case 'BLUE':
              icon = '🔵';
              bgColor = '#4dabf7';
              break;
            case 'YELLOW':
              icon = '🟡';
              bgColor = '#ffd43b';
              break;
            case 'BOMB':
              icon = '💣';
              bgColor = '#495057';
              break;
          }
          
          birdIcon.innerHTML = icon;
          birdIcon.style.cssText = `
            font-size: 28px;
            background: linear-gradient(135deg, ${bgColor} 0%, ${this.darkenColor(bgColor, 20)} 100%);
            border-radius: 50%;
            width: 48px;
            height: 48px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid rgba(255, 255, 255, 0.8);
            box-shadow: 
              0 4px 8px rgba(0,0,0,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.3);
            transition: all 0.2s ease;
            cursor: default;
          `;
          
          birdIcon.onmouseenter = () => {
            birdIcon.style.transform = 'scale(1.15) translateY(-2px)';
            birdIcon.style.boxShadow = `
              0 6px 12px rgba(0,0,0,0.4),
              inset 0 -2px 4px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.3)
            `;
          };
          birdIcon.onmouseleave = () => {
            birdIcon.style.transform = 'scale(1) translateY(0)';
            birdIcon.style.boxShadow = `
              0 4px 8px rgba(0,0,0,0.3),
              inset 0 -2px 4px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.3)
            `;
          };
          
          container.appendChild(birdIcon);
        });
      }
    }
  }

  // Helper function to darken a color
  darkenColor(color, percent) {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Darken
    const darkenedR = Math.max(0, Math.floor(r * (1 - percent / 100)));
    const darkenedG = Math.max(0, Math.floor(g * (1 - percent / 100)));
    const darkenedB = Math.max(0, Math.floor(b * (1 - percent / 100)));
    
    // Convert back to hex
    return `#${darkenedR.toString(16).padStart(2, '0')}${darkenedG.toString(16).padStart(2, '0')}${darkenedB.toString(16).padStart(2, '0')}`;
  }

  hideLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      gsap.to(loadingScreen, {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
          loadingScreen.classList.add('hidden');
        }
      });
    }
  }
}

