// Enhanced Game Manager with VR Support and Dynamic Features
const Game = {
  state: 'menu', // menu, playing, gameover
  wave: 1,
  score: 0,
  hp: 100,
  maxHp: 100,
  alive: true,
  enemiesAlive: 0,
  enemiesSpawned: 0,
  powerups: {
    instakill: false,
    maxammo: false,
    shield: false,
    speed: false
  },
  powerupTimers: {},
  
  // Enhanced game settings
  settings: {
    difficulty: 'normal', // easy, normal, hard, nightmare
    zombieVariety: true,
    powerupsEnabled: true,
    environmentEffects: true
  },
  
  init() {
    console.log('Game Manager initializing...');
    this.setupEventListeners();
    this.setupVRControls();
    this.initializeUI();
    this.setupAudio();
    this.startBackgroundSystems();
  },
  
  setupEventListeners() {
    // Menu handlers
    const startBtn = document.getElementById('startBtn');
    const retryBtn = document.getElementById('retryBtn');
    
    if (startBtn) {
      startBtn.onclick = () => this.startGame();
    }
    
    if (retryBtn) {
      retryBtn.onclick = () => this.restartGame();
    }
    
    // Game events
    document.addEventListener('zombie-killed', (evt) => {
      this.onZombieKilled(evt);
    });
    
    document.addEventListener('zombie-hit-player', (evt) => {
      this.onPlayerHit(evt);
    });
    
    document.addEventListener('powerup-collected', (evt) => {
      this.onPowerupCollected(evt);
    });
  },
  
  setupVRControls() {
    const rig = document.getElementById('rig');
    if (rig) {
      // Quick start for VR controllers
      const quickStart = () => {
        if (this.state === 'menu') {
          this.startGame();
        }
      };
      
      // Listen for controller button presses
      rig.addEventListener('abuttondown', quickStart, { once: true });
      rig.addEventListener('triggerdown', quickStart, { once: true });
      
      // VR restart functionality
      rig.addEventListener('ybuttondown', () => {
        if (this.state === 'gameover') {
          this.restartGame();
        }
      });
    }
  },
  
  initializeUI() {
    this.updateHUD();
    this.setupDynamicUI();
  },
  
  setupDynamicUI() {
    // Create VR restart button
    const vrRestartBtn = document.createElement('div');
    vrRestartBtn.id = 'vrRestartBtn';
    vrRestartBtn.textContent = 'Press Y to Restart';
    vrRestartBtn.style.display = 'none';
    document.body.appendChild(vrRestartBtn);
  },
  
  setupAudio() {
    // Initialize audio context for better sound
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.log('Audio context not supported');
    }
  },
  
  startBackgroundSystems() {
    // Start lighting manager
    const scene = document.querySelector('a-scene');
    if (scene) {
      scene.setAttribute('lighting-manager', '');
    }
    
    // Start environment effects
    this.startEnvironmentEffects();
  },
  
  startEnvironmentEffects() {
    if (this.settings.environmentEffects) {
      // Dynamic weather changes
      this.weatherTimer = setInterval(() => {
        this.updateWeather();
      }, 30000); // Change weather every 30 seconds
      
      // Dynamic time of day (slower)
      this.timeTimer = setInterval(() => {
        this.updateTimeOfDay();
      }, 120000); // Change every 2 minutes
    }
  },
  
  startGame() {
    if (this.state !== 'menu') return;
    
    console.log('Starting game...');
    this.state = 'playing';
    this.wave = 1;
    this.score = 0;
    this.hp = this.maxHp;
    this.alive = true;
    this.enemiesAlive = 0;
    this.enemiesSpawned = 0;
    
    // Clear all powerups
    Object.keys(this.powerups).forEach(key => {
      this.powerups[key] = false;
    });
    Object.keys(this.powerupTimers).forEach(key => {
      clearTimeout(this.powerupTimers[key]);
    });
    this.powerupTimers = {};
    
    // UI updates
    document.getElementById('menu').style.display = 'none';
    document.getElementById('hud2d').style.display = 'flex';
    document.getElementById('gameover').style.display = 'none';
    
    this.updateHUD();
    this.startWave();
    
    // Emit state change event
    this.emitStateChange('playing');
    
    // Start game-specific systems
    this.startGameplayLoop();
  },
  
  startGameplayLoop() {
    // Health regeneration (slow)
    this.healthRegenTimer = setInterval(() => {
      if (this.alive && this.hp < this.maxHp && this.hp > 0) {
        this.hp = Math.min(this.maxHp, this.hp + 1);
        this.updateHUD();
      }
    }, 5000);
    
    // Auto-save progress
    this.autoSaveTimer = setInterval(() => {
      this.saveProgress();
    }, 30000);
  },
  
  startWave() {
    if (this.state !== 'playing') return;
    
    console.log(`Starting wave ${this.wave}`);
    
    // Wave configuration
    const config = this.getWaveConfig();
    this.enemiesSpawned = 0;
    
    // Emit wave start event
    document.dispatchEvent(new CustomEvent('zombie-wave-start', {
      detail: { wave: this.wave, config }
    }));
    
    // Spawn zombies
    this.spawnWave(config);
  },
  
  getWaveConfig() {
    const base = {
      count: Math.min(6 + (this.wave - 1) * 2, 80),
      baseSpeed: 0.6 + (this.wave - 1) * 0.08,
      baseHp: Math.ceil(3 + this.wave * 0.8),
      spawnDelay: Math.max(400, 800 - this.wave * 25)
    };
    
    // Difficulty modifiers
    switch (this.settings.difficulty) {
      case 'easy':
        base.count *= 0.7;
        base.baseSpeed *= 0.8;
        base.baseHp *= 0.8;
        break;
      case 'hard':
        base.count *= 1.3;
        base.baseSpeed *= 1.2;
        base.baseHp *= 1.2;
        break;
      case 'nightmare':
        base.count *= 1.6;
        base.baseSpeed *= 1.4;
        base.baseHp *= 1.5;
        break;
    }
    
    return base;
  },
  
  spawnWave(config) {
    const spawnZombie = () => {
      if (this.enemiesSpawned >= config.count || this.state !== 'playing') {
        return;
      }
      
      const zombie = this.createZombie(config);
      this.enemiesSpawned++;
      this.enemiesAlive++;
      
      // Schedule next spawn
      setTimeout(spawnZombie, config.spawnDelay);
    };
    
    spawnZombie();
  },
  
  createZombie(config) {
    const zombie = document.createElement('a-entity');
    
    // Zombie type variety
    const types = ['male', 'female'];
    const zombieType = types[Math.floor(Math.random() * types.length)];
    
    // Stats with variation
    const speed = config.baseSpeed + (Math.random() - 0.5) * 0.3;
    const hp = Math.ceil(config.baseHp + (Math.random() - 0.5) * 2);
    
    zombie.setAttribute('zombie', `speed: ${speed}; hp: ${hp}; zombieType: ${zombieType}`);
    zombie.setAttribute('shadow', 'cast: true');
    
    // Spawn position (ring around player)
    const spawnRadius = 6 + Math.random() * 2;
    const angle = Math.random() * Math.PI * 2;
    const x = Math.cos(angle) * spawnRadius;
    const z = Math.sin(angle) * spawnRadius;
    
    zombie.setAttribute('position', `${x} 0 ${z}`);
    
    // Event listeners
    zombie.addEventListener('zombie-killed', () => {
      this.onZombieKilled({ detail: { zombie, position: zombie.object3D.position } });
    });
    
    zombie.addEventListener('zombie-hit-player', () => {
      this.onPlayerHit({ detail: { zombie } });
    });
    
    document.querySelector('a-scene').appendChild(zombie);
    return zombie;
  },
  
  onZombieKilled(evt) {
    this.enemiesAlive--;
    
    // Maybe drop powerup
    if (this.settings.powerupsEnabled) {
      this.maybeDrop(evt.detail.position);
    }
    
    // Check wave completion
    if (this.enemiesAlive <= 0 && this.enemiesSpawned >= this.getWaveConfig().count) {
      setTimeout(() => {
        if (this.state === 'playing') {
          this.completeWave();
        }
      }, 1500);
    }
  },
  
  onPlayerHit(evt) {
    if (!this.alive || this.powerups.shield) return;
    
    const damage = this.calculatePlayerDamage();
    this.hp -= damage;
    
    if (this.hp < 0) this.hp = 0;
    
    this.updateHUD();
    this.showDamageEffect();
    
    if (this.hp <= 0) {
      this.gameOver();
    }
  },
  
  calculatePlayerDamage() {
    let baseDamage = 8;
    
    // Difficulty modifiers
    switch (this.settings.difficulty) {
      case 'easy':
        baseDamage *= 0.7;
        break;
      case 'hard':
        baseDamage *= 1.3;
        break;
      case 'nightmare':
        baseDamage *= 1.6;
        break;
    }
    
    return Math.ceil(baseDamage);
  },
  
  showDamageEffect() {
    // Red flash effect
    const scene = document.querySelector('a-scene');
    const flash = document.createElement('a-entity');
    flash.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
    flash.setAttribute('material', 'color: #ff0000; opacity: 0.3; transparent: true; side: double');
    flash.setAttribute('position', '0 1.6 -0.5');
    flash.setAttribute('scale', '20 20 20');
    flash.setAttribute('animation', 'property: material.opacity; to: 0; dur: 200');
    
    const camera = document.querySelector('#player');
    if (camera) {
      camera.appendChild(flash);
      setTimeout(() => flash.remove(), 200);
    }
  },
  
  completeWave() {
    this.wave++;
    this.updateHUD();
    
    // Bonus points for wave completion
    const bonus = this.wave * 50;
    this.addScore(bonus);
    
    // Wave completion effects
    this.showWaveCompleteEffect();
    
    // Start next wave
    setTimeout(() => {
      this.startWave();
    }, 2000);
  },
  
  showWaveCompleteEffect() {
    // Show wave complete message in VR space
    const message = document.createElement('a-entity');
    message.setAttribute('text', `value: WAVE ${this.wave - 1} COMPLETE!\\n+${this.wave * 50} Bonus; align: center; color: #00ff00; width: 12`);
    message.setAttribute('position', '0 2.5 -3');
    message.setAttribute('animation', 'property: position; to: 0 3.5 -3; dur: 2000; easing: easeOutQuad');
    message.setAttribute('animation__fade', 'property: text.color; to: #004400; dur: 2000');
    
    document.querySelector('a-scene').appendChild(message);
    setTimeout(() => message.remove(), 2000);
  },
  
  maybeDrop(position) {
    if (Math.random() < 0.18) { // 18% drop chance
      const powerupTypes = ['instakill', 'maxammo', 'shield', 'speed'];
      const type = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
      
      this.createPowerup(type, position);
    }
  },
  
  createPowerup(type, position) {
    const powerup = document.createElement('a-entity');
    
    // Visual properties based on type
    const config = this.getPowerupConfig(type);
    powerup.setAttribute('geometry', config.geometry);
    powerup.setAttribute('material', config.material);
    powerup.setAttribute('position', `${position.x} 0.3 ${position.z}`);
    powerup.setAttribute('powerup', `type: ${type}`);
    powerup.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 2000; loop: true; easing: linear');
    powerup.setAttribute('animation__bob', 'property: position; to: 0 0.6 0; dur: 1500; direction: alternate; loop: true; easing: easeInOutQuad');
    
    document.querySelector('a-scene').appendChild(powerup);
    
    // Auto-remove after 15 seconds
    setTimeout(() => {
      if (powerup.parentNode) {
        powerup.remove();
      }
    }, 15000);
  },
  
  getPowerupConfig(type) {
    const configs = {
      instakill: {
        geometry: 'primitive: dodecahedron; radius: 0.25',
        material: 'color: #ff4444; emissive: #ff4444; emissiveIntensity: 0.3'
      },
      maxammo: {
        geometry: 'primitive: octahedron; radius: 0.25',
        material: 'color: #4444ff; emissive: #4444ff; emissiveIntensity: 0.3'
      },
      shield: {
        geometry: 'primitive: icosahedron; radius: 0.25',
        material: 'color: #44ff44; emissive: #44ff44; emissiveIntensity: 0.3'
      },
      speed: {
        geometry: 'primitive: tetrahedron; radius: 0.25',
        material: 'color: #ffff44; emissive: #ffff44; emissiveIntensity: 0.3'
      }
    };
    
    return configs[type] || configs.instakill;
  },
  
  onPowerupCollected(evt) {
    const type = evt.detail.type;
    this.activatePowerup(type);
  },
  
  activatePowerup(type) {
    // Clear existing timer if any
    if (this.powerupTimers[type]) {
      clearTimeout(this.powerupTimers[type]);
    }
    
    this.powerups[type] = true;
    
    // Apply powerup effects
    switch (type) {
      case 'instakill':
        this.powerupTimers[type] = setTimeout(() => {
          this.powerups[type] = false;
          this.updateHUD();
        }, 8000);
        break;
        
      case 'maxammo':
        const gun = document.querySelector('#rightHand')?.components?.gun;
        if (gun) {
          gun.reserve = 120;
          gun.magazine = gun.maxMag;
          gun.updateUI();
        }
        this.powerupTimers[type] = setTimeout(() => {
          this.powerups[type] = false;
          this.updateHUD();
        }, 6000);
        break;
        
      case 'shield':
        this.powerupTimers[type] = setTimeout(() => {
          this.powerups[type] = false;
          this.updateHUD();
        }, 10000);
        break;
        
      case 'speed':
        const controls = document.querySelector('#rig')?.components?.['vr-controls'];
        if (controls) {
          controls.baseSpeed *= 1.5;
        }
        this.powerupTimers[type] = setTimeout(() => {
          this.powerups[type] = false;
          if (controls) {
            controls.baseSpeed /= 1.5;
          }
          this.updateHUD();
        }, 12000);
        break;
    }
    
    this.updateHUD();
    this.showPowerupEffect(type);
  },
  
  showPowerupEffect(type) {
    // Visual effect for powerup activation
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: ring; radiusInner: 0.5; radiusOuter: 1.5');
    effect.setAttribute('material', `color: ${this.getPowerupConfig(type).material.split(';')[0].split(':')[1]}; opacity: 0.7; transparent: true`);
    effect.setAttribute('position', '0 0.1 -2');
    effect.setAttribute('rotation', '90 0 0');
    effect.setAttribute('animation', 'property: scale; to: 3 3 3; dur: 500; easing: easeOutQuad');
    effect.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 500');
    
    document.querySelector('a-scene').appendChild(effect);
    setTimeout(() => effect.remove(), 500);
  },
  
  updateHUD() {
    document.getElementById('hudWave').textContent = `Wave ${this.wave}`;
    document.getElementById('hudScore').textContent = `Score ${this.score}`;
    document.getElementById('hudHP').textContent = `HP ${this.hp}`;
    
    // Powerups display
    const activePowerups = [];
    Object.keys(this.powerups).forEach(key => {
      if (this.powerups[key]) {
        activePowerups.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    });
    
    document.getElementById('hudPowers').textContent = activePowerups.join(' • ') || '—';
  },
  
  addScore(points) {
    this.score += points;
    this.updateHUD();
    
    // Score popup effect
    this.showScorePopup(points);
  },
  
  showScorePopup(points) {
    const popup = document.createElement('a-entity');
    popup.setAttribute('text', `value: +${points}; align: center; color: #ffff00; width: 8`);
    popup.setAttribute('position', '0 1.8 -1.5');
    popup.setAttribute('animation', 'property: position; to: 0 2.3 -1.5; dur: 800; easing: easeOutQuad');
    popup.setAttribute('animation__fade', 'property: text.color; to: #444400; dur: 800');
    
    document.querySelector('#player').appendChild(popup);
    setTimeout(() => popup.remove(), 800);
  },
  
  gameOver() {
    console.log('Game Over');
    this.state = 'gameover';
    this.alive = false;
    
    // Clear timers
    this.clearGameTimers();
    
    // UI updates
    document.getElementById('hud2d').style.display = 'none';
    document.getElementById('vrRestartBtn').style.display = 'block';
    
    const finalScore = document.getElementById('finalScore');
    if (finalScore) {
      finalScore.textContent = `Score ${this.score} • Wave ${this.wave}`;
    }
    
    document.getElementById('gameover').style.display = 'grid';
    
    // Save high score
    this.saveHighScore();
    
    // Emit state change
    this.emitStateChange('gameover');
    
    // Game over effects
    this.showGameOverEffects();
  },
  
  clearGameTimers() {
    if (this.healthRegenTimer) {
      clearInterval(this.healthRegenTimer);
    }
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
    }
    Object.values(this.powerupTimers).forEach(timer => clearTimeout(timer));
  },
  
  showGameOverEffects() {
    // Dramatic lighting change
    const lightingManager = document.querySelector('[lighting-manager]');
    if (lightingManager && lightingManager.components['lighting-manager']) {
      lightingManager.components['lighting-manager'].lightingSystem?.setGameplayLighting('gameover');
    }
    
    // Screen effect
    this.showDeathEffect();
  },
  
  showDeathEffect() {
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
    effect.setAttribute('material', 'color: #000000; opacity: 0; transparent: true; side: double');
    effect.setAttribute('position', '0 1.6 -0.1');
    effect.setAttribute('scale', '50 50 50');
    effect.setAttribute('animation', 'property: material.opacity; to: 0.8; dur: 2000; easing: easeInQuad');
    
    const camera = document.querySelector('#player');
    if (camera) {
      camera.appendChild(effect);
    }
  },
  
  restartGame() {
    location.reload();
  },
  
  emitStateChange(state) {
    document.dispatchEvent(new CustomEvent('game-state-changed', {
      detail: { state, wave: this.wave, score: this.score }
    }));
  },
  
  saveProgress() {
    try {
      const progress = {
        wave: this.wave,
        score: this.score,
        timestamp: Date.now()
      };
      localStorage.setItem('zombieGame_progress', JSON.stringify(progress));
    } catch (e) {
      console.log('Could not save progress');
    }
  },
  
  saveHighScore() {
    try {
      const highScore = localStorage.getItem('zombieGame_highScore') || 0;
      if (this.score > highScore) {
        localStorage.setItem('zombieGame_highScore', this.score);
      }
    } catch (e) {
      console.log('Could not save high score');
    }
  },
  
  updateWeather() {
    // Simple weather effects
    const weather = ['clear', 'rain', 'storm'][Math.floor(Math.random() * 3)];
    console.log(`Weather changing to: ${weather}`);
    // Implementation would depend on weather system
  },
  
  updateTimeOfDay() {
    // Simple day/night cycle
    const timeOfDay = ['dawn', 'day', 'dusk', 'night'][Math.floor(Math.random() * 4)];
    console.log(`Time changing to: ${timeOfDay}`);
    // Implementation would depend on lighting system
  }
};

// Component wrapper for A-Frame
AFRAME.registerComponent('game-manager', {
  init() {
    Game.init();
  }
});

// Enhanced powerup component
AFRAME.registerComponent('powerup', {
  schema: {
    type: { default: 'maxammo' }
  },
  
  init() {
    this.collected = false;
  },
  
  tick(time, deltaTime) {
    if (this.collected) return;
    
    // Rotation animation (handled by attributes, but we can add logic here)
    
    // Check for player proximity
    const player = document.querySelector('#rig').object3D.position;
    const myPos = this.el.object3D.position;
    const distance = myPos.distanceTo(player);
    
    if (distance < 1.2) {
      this.collect();
    }
  },
  
  collect() {
    if (this.collected) return;
    
    this.collected = true;
    
    // Emit collection event
    document.dispatchEvent(new CustomEvent('powerup-collected', {
      detail: { type: this.data.type }
    }));
    
    // Collection effect
    this.showCollectionEffect();
    
    // Remove powerup
    this.el.remove();
  },
  
  showCollectionEffect() {
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: sphere; radius: 0.3');
    effect.setAttribute('material', 'color: #ffffff; emissive: #ffffff; emissiveIntensity: 1; opacity: 0.8; transparent: true');
    effect.setAttribute('position', this.el.getAttribute('position'));
    effect.setAttribute('animation', 'property: scale; to: 3 3 3; dur: 300; easing: easeOutQuad');
    effect.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 300');
    
    document.querySelector('a-scene').appendChild(effect);
    setTimeout(() => effect.remove(), 300);
  }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Game;
}
