// Enhanced Lighting System for Immersive VR Experience
AFRAME.registerComponent('dynamic-lighting', {
  init() {
    this.createLightingSystem();
    this.setupLightAnimations();
    this.createWeatherEffects();
  },
  
  createLightingSystem() {
    const scene = document.querySelector('a-scene');
    
    // Enhanced ambient lighting with color variation
    const ambientLight = document.createElement('a-entity');
    ambientLight.setAttribute('id', 'ambientLight');
    ambientLight.setAttribute('light', 'type: ambient; intensity: 0.25; color: #4a5568');
    scene.appendChild(ambientLight);
    
    // Main moonlight (directional)
    const moonLight = document.createElement('a-entity');
    moonLight.setAttribute('id', 'moonLight');
    moonLight.setAttribute('position', '8 12 -10');
    moonLight.setAttribute('light', 'type: directional; castShadow: true; intensity: 0.6; color: #9ab3d1; shadowMapWidth: 2048; shadowMapHeight: 2048; shadowCameraLeft: -10; shadowCameraRight: 10; shadowCameraTop: 10; shadowCameraBottom: -10');
    moonLight.setAttribute('animation', 'property: rotation; to: 0 15 0; dur: 60000; loop: true; easing: linear');
    scene.appendChild(moonLight);
    this.moonLight = moonLight;
    
    // Flickering house light (main interior)
    const houseLight = document.createElement('a-entity');
    houseLight.setAttribute('id', 'houseLight');
    houseLight.setAttribute('position', '0 2.5 -1');
    houseLight.setAttribute('light', 'type: point; intensity: 1.2; distance: 8; decay: 2; color: #ffd700; castShadow: true');
    scene.appendChild(houseLight);
    this.houseLight = houseLight;
    
    // Emergency red light (creates tension)
    const emergencyLight = document.createElement('a-entity');
    emergencyLight.setAttribute('id', 'emergencyLight');
    emergencyLight.setAttribute('position', '-4 2.8 2');
    emergencyLight.setAttribute('light', 'type: spot; intensity: 0.8; distance: 6; angle: 30; penumbra: 0.2; color: #ff4444; castShadow: true');
    emergencyLight.setAttribute('animation', 'property: light.intensity; to: 0.2; dur: 1500; direction: alternate; loop: true; easing: easeInOutQuad');
    scene.appendChild(emergencyLight);
    this.emergencyLight = emergencyLight;
    
    // Street lamp outside (atmospheric)
    const streetLamp = document.createElement('a-entity');
    streetLamp.setAttribute('id', 'streetLamp');
    streetLamp.setAttribute('position', '6 3 8');
    streetLamp.setAttribute('light', 'type: point; intensity: 0.7; distance: 12; decay: 1.5; color: #f4e4bc');
    scene.appendChild(streetLamp);
    
    // Broken sparking light (dramatic effect)
    const sparkingLight = document.createElement('a-entity');
    sparkingLight.setAttribute('id', 'sparkingLight');
    sparkingLight.setAttribute('position', '3 2.2 -3');
    sparkingLight.setAttribute('light', 'type: point; intensity: 0; distance: 5; decay: 2; color: #88ccff');
    scene.appendChild(sparkingLight);
    this.sparkingLight = sparkingLight;
    
    // Window light (coming from outside)
    const windowLight1 = document.createElement('a-entity');
    windowLight1.setAttribute('position', '-2 1.5 -6.2');
    windowLight1.setAttribute('light', 'type: spot; intensity: 0.4; distance: 4; angle: 45; color: #9ab3d1');
    windowLight1.setAttribute('rotation', '0 0 0');
    scene.appendChild(windowLight1);
    
    const windowLight2 = document.createElement('a-entity');
    windowLight2.setAttribute('position', '2 1.5 -6.2');
    windowLight2.setAttribute('light', 'type: spot; intensity: 0.4; distance: 4; angle: 45; color: #9ab3d1');
    windowLight2.setAttribute('rotation', '0 0 0');
    scene.appendChild(windowLight2);
    
    // Fire barrel light (outside for atmosphere)
    const fireLight = document.createElement('a-entity');
    fireLight.setAttribute('id', 'fireLight');
    fireLight.setAttribute('position', '-8 1 4');
    fireLight.setAttribute('light', 'type: point; intensity: 1.0; distance: 8; decay: 2; color: #ff6600');
    scene.appendChild(fireLight);
    this.fireLight = fireLight;
    
    // Lightning effect light (disabled by default)
    const lightningLight = document.createElement('a-entity');
    lightningLight.setAttribute('id', 'lightningLight');
    lightningLight.setAttribute('position', '0 15 0');
    lightningLight.setAttribute('light', 'type: directional; intensity: 0; color: #ffffff; castShadow: false');
    scene.appendChild(lightningLight);
    this.lightningLight = lightningLight;
  },
  
  setupLightAnimations() {
    // House light flickering
    this.flickerHouseLight();
    
    // Sparking light random bursts
    this.sparkLight();
    
    // Fire light dancing
    this.animateFireLight();
    
    // Random lightning
    this.scheduleLightning();
  },
  
  flickerHouseLight() {
    if (!this.houseLight) return;
    
    const flicker = () => {
      const intensity = 0.8 + Math.random() * 0.8;
      const color = Math.random() > 0.95 ? '#ffaa00' : '#ffd700'; // Occasional orange flicker
      
      this.houseLight.setAttribute('light', `intensity: ${intensity}; color: ${color}`);
      
      // Next flicker in 100-500ms
      setTimeout(flicker, 100 + Math.random() * 400);
    };
    
    flicker();
  },
  
  sparkLight() {
    if (!this.sparkingLight) return;
    
    const spark = () => {
      // Random spark burst
      if (Math.random() < 0.1) { // 10% chance every interval
        this.sparkingLight.setAttribute('light', 'intensity: 2.0');
        
        // Create spark particles
        this.createSparkParticles();
        
        setTimeout(() => {
          this.sparkingLight.setAttribute('light', 'intensity: 0');
        }, 50 + Math.random() * 100);
      }
      
      // Check again in 200-800ms
      setTimeout(spark, 200 + Math.random() * 600);
    };
    
    spark();
  },
  
  createSparkParticles() {
    const sparkCount = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < sparkCount; i++) {
      const spark = document.createElement('a-entity');
      spark.setAttribute('geometry', 'primitive: sphere; radius: 0.02');
      spark.setAttribute('material', 'color: #88ccff; emissive: #88ccff; emissiveIntensity: 1');
      
      const x = 3 + (Math.random() - 0.5) * 0.4;
      const y = 2.2 + (Math.random() - 0.5) * 0.3;
      const z = -3 + (Math.random() - 0.5) * 0.4;
      
      spark.setAttribute('position', `${x} ${y} ${z}`);
      
      // Falling animation
      const fallX = x + (Math.random() - 0.5) * 0.5;
      const fallY = y - 0.5 - Math.random() * 0.8;
      const fallZ = z + (Math.random() - 0.5) * 0.5;
      
      spark.setAttribute('animation', `property: position; to: ${fallX} ${fallY} ${fallZ}; dur: 800; easing: easeInQuad`);
      spark.setAttribute('animation__fade', 'property: material.emissiveIntensity; to: 0; dur: 800');
      
      document.querySelector('a-scene').appendChild(spark);
      setTimeout(() => spark.remove(), 800);
    }
  },
  
  animateFireLight() {
    if (!this.fireLight) return;
    
    const flicker = () => {
      const intensity = 0.7 + Math.random() * 0.6;
      const hue = 15 + Math.random() * 15; // Orange to red variation
      const color = `hsl(${hue}, 100%, 50%)`;
      
      this.fireLight.setAttribute('light', `intensity: ${intensity}; color: ${color}`);
      
      setTimeout(flicker, 80 + Math.random() * 120);
    };
    
    flicker();
  },
  
  scheduleLightning() {
    const lightning = () => {
      if (Math.random() < 0.05) { // 5% chance
        this.createLightning();
      }
      
      // Next check in 5-15 seconds
      setTimeout(lightning, 5000 + Math.random() * 10000);
    };
    
    lightning();
  },
  
  createLightning() {
    if (!this.lightningLight) return;
    
    // Lightning flash sequence
    const flash = () => {
      this.lightningLight.setAttribute('light', 'intensity: 3.0');
      
      setTimeout(() => {
        this.lightningLight.setAttribute('light', 'intensity: 0');
        
        // Second flash (typical lightning pattern)
        setTimeout(() => {
          this.lightningLight.setAttribute('light', 'intensity: 2.5');
          
          setTimeout(() => {
            this.lightningLight.setAttribute('light', 'intensity: 0');
          }, 100);
        }, 150);
      }, 100);
    };
    
    flash();
    
    // Thunder sound effect could be added here
    // this.playThunderSound();
  },
  
  createWeatherEffects() {
    // Rain particles
    this.createRain();
    
    // Fog enhancement
    this.enhanceFog();
  },
  
  createRain() {
    const rainContainer = document.createElement('a-entity');
    rainContainer.setAttribute('id', 'rainContainer');
    rainContainer.setAttribute('position', '0 8 0');
    
    for (let i = 0; i < 200; i++) {
      const raindrop = document.createElement('a-entity');
      raindrop.setAttribute('geometry', 'primitive: cylinder; radius: 0.002; height: 0.1');
      raindrop.setAttribute('material', 'color: #87ceeb; opacity: 0.6; transparent: true');
      
      const x = (Math.random() - 0.5) * 20;
      const y = Math.random() * 5;
      const z = (Math.random() - 0.5) * 20;
      
      raindrop.setAttribute('position', `${x} ${y} ${z}`);
      
      // Falling animation
      const fallDuration = 2000 + Math.random() * 1000;
      raindrop.setAttribute('animation', `property: position; to: ${x} -2 ${z}; dur: ${fallDuration}; loop: true; easing: linear`);
      
      rainContainer.appendChild(raindrop);
    }
    
    document.querySelector('a-scene').appendChild(rainContainer);
  },
  
  enhanceFog() {
    const scene = document.querySelector('a-scene');
    scene.setAttribute('fog', 'type: exponential; density: 0.035; color: #2a2a3a');
  },
  
  // Methods to control lighting during gameplay
  setGameplayLighting(state) {
    switch(state) {
      case 'menu':
        this.setMenuLighting();
        break;
      case 'playing':
        this.setPlayingLighting();
        break;
      case 'gameover':
        this.setGameOverLighting();
        break;
    }
  },
  
  setMenuLighting() {
    // Warmer, more inviting lighting for menu
    if (this.houseLight) {
      this.houseLight.setAttribute('light', 'intensity: 1.5; color: #ffd700');
    }
    if (this.emergencyLight) {
      this.emergencyLight.setAttribute('light', 'intensity: 0.3');
    }
  },
  
  setPlayingLighting() {
    // Tenser, more dramatic lighting during gameplay
    if (this.houseLight) {
      this.houseLight.setAttribute('light', 'intensity: 1.0; color: #ffcc88');
    }
    if (this.emergencyLight) {
      this.emergencyLight.setAttribute('light', 'intensity: 0.8');
    }
  },
  
  setGameOverLighting() {
    // Dark, ominous lighting for game over
    if (this.houseLight) {
      this.houseLight.setAttribute('light', 'intensity: 0.3; color: #ff6666');
    }
    if (this.emergencyLight) {
      this.emergencyLight.setAttribute('light', 'intensity: 1.2');
    }
  },
  
  // Power outage effect
  createPowerOutage(duration = 3000) {
    const originalIntensities = {};
    
    // Store original intensities
    const lights = ['houseLight', 'emergencyLight', 'streetLamp'];
    lights.forEach(lightName => {
      if (this[lightName]) {
        const light = this[lightName].getAttribute('light');
        originalIntensities[lightName] = light.intensity;
        this[lightName].setAttribute('light', 'intensity: 0');
      }
    });
    
    // Only moonlight and fire remain
    setTimeout(() => {
      // Restore power gradually
      lights.forEach(lightName => {
        if (this[lightName] && originalIntensities[lightName]) {
          this[lightName].setAttribute('light', `intensity: ${originalIntensities[lightName]}`);
        }
      });
    }, duration);
  }
});

// Component to sync lighting with game state
AFRAME.registerComponent('lighting-manager', {
  init() {
    this.lightingSystem = null;
    
    // Wait for lighting system to initialize
    setTimeout(() => {
      this.lightingSystem = document.querySelector('[dynamic-lighting]')?.components['dynamic-lighting'];
    }, 1000);
    
    // Listen for game state changes
    this.el.addEventListener('game-state-changed', (evt) => {
      if (this.lightingSystem) {
        this.lightingSystem.setGameplayLighting(evt.detail.state);
      }
    });
    
    // Listen for special events
    this.el.addEventListener('zombie-wave-start', () => {
      if (Math.random() < 0.3) { // 30% chance of power outage during wave start
        this.lightingSystem?.createPowerOutage(2000);
      }
    });
  }
});
