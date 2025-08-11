// Enhanced Realistic Gun Component with Cool Visual Design
AFRAME.registerComponent('gun', {
  init() {
    this.cooldown = 0;
    this.magazine = 15; // Increased ammo
    this.reserve = 90;
    this.maxMag = 15;
    this.canShoot = true;
    this.tmp = new THREE.Vector3();
    this.raycaster = new THREE.Raycaster();
    this.enemies = [];
    this.isReloading = false;
    
    // Create detailed gun model
    this.createGunModel();
    
    // Audio context for gun sounds
    this.createAudioElements();
    
    // Muzzle flash effects
    this.muzzleFlash = null;
    
    // Update UI
    this.updateUI();
    
    // Event listeners
    this.el.addEventListener('triggerdown', () => this.shoot());
    this.el.addEventListener('abuttondown', () => this.reload());
    this.el.addEventListener('bbuttondown', () => this.toggleSafety());
    
    // Update enemy list periodically
    setInterval(() => {
      this.enemies = [...document.querySelectorAll('.enemy')].map(e => e.object3D);
    }, 250);
    
    // Gun safety (optional feature)
    this.safetyOn = false;
  },
  
  createGunModel() {
    // Main gun container
    const gunContainer = document.createElement('a-entity');
    gunContainer.setAttribute('id', 'gunModel');
    gunContainer.setAttribute('position', '0 -0.1 -0.15');
    gunContainer.setAttribute('rotation', '0 0 0');
    
    // Gun barrel
    const barrel = document.createElement('a-entity');
    barrel.setAttribute('geometry', 'primitive: cylinder; radius: 0.02; height: 0.35; segmentsRadial: 12');
    barrel.setAttribute('material', 'color: #2c2c2c; metalness: 0.8; roughness: 0.2');
    barrel.setAttribute('position', '0 0 -0.15');
    barrel.setAttribute('rotation', '90 0 0');
    gunContainer.appendChild(barrel);
    
    // Barrel tip
    const barrelTip = document.createElement('a-entity');
    barrelTip.setAttribute('geometry', 'primitive: cylinder; radius: 0.025; height: 0.03; segmentsRadial: 12');
    barrelTip.setAttribute('material', 'color: #1a1a1a; metalness: 0.9; roughness: 0.1');
    barrelTip.setAttribute('position', '0 0 -0.32');
    barrelTip.setAttribute('rotation', '90 0 0');
    gunContainer.appendChild(barrelTip);
    
    // Gun body/receiver
    const receiver = document.createElement('a-entity');
    receiver.setAttribute('geometry', 'primitive: box; width: 0.08; height: 0.12; depth: 0.25');
    receiver.setAttribute('material', 'color: #3a3a3a; metalness: 0.7; roughness: 0.3');
    receiver.setAttribute('position', '0 0.01 -0.05');
    gunContainer.appendChild(receiver);
    
    // Trigger guard
    const triggerGuard = document.createElement('a-entity');
    triggerGuard.setAttribute('geometry', 'primitive: torus; radius: 0.035; radiusTubular: 0.008; segmentsRadial: 16; segmentsTubular: 32');
    triggerGuard.setAttribute('material', 'color: #2c2c2c; metalness: 0.8; roughness: 0.2');
    triggerGuard.setAttribute('position', '0 -0.04 0.02');
    triggerGuard.setAttribute('rotation', '90 0 0');
    gunContainer.appendChild(triggerGuard);
    
    // Trigger
    const trigger = document.createElement('a-entity');
    trigger.setAttribute('geometry', 'primitive: box; width: 0.015; height: 0.03; depth: 0.008');
    trigger.setAttribute('material', 'color: #4a4a4a; metalness: 0.6; roughness: 0.4');
    trigger.setAttribute('position', '0 -0.04 0.02');
    gunContainer.appendChild(trigger);
    this.trigger = trigger;
    
    // Magazine
    const magazine = document.createElement('a-entity');
    magazine.setAttribute('geometry', 'primitive: box; width: 0.06; height: 0.15; depth: 0.08');
    magazine.setAttribute('material', 'color: #2a2a2a; metalness: 0.7; roughness: 0.3');
    magazine.setAttribute('position', '0 -0.08 0.05');
    gunContainer.appendChild(magazine);
    this.magazine_model = magazine;
    
    // Grip
    const grip = document.createElement('a-entity');
    grip.setAttribute('geometry', 'primitive: box; width: 0.07; height: 0.12; depth: 0.09');
    grip.setAttribute('material', 'color: #1a1a1a; metalness: 0.3; roughness: 0.7');
    grip.setAttribute('position', '0 -0.06 0.08');
    gunContainer.appendChild(grip);
    
    // Scope/sight
    const sight = document.createElement('a-entity');
    sight.setAttribute('geometry', 'primitive: box; width: 0.04; height: 0.02; depth: 0.06');
    sight.setAttribute('material', 'color: #2c2c2c; metalness: 0.8; roughness: 0.2');
    sight.setAttribute('position', '0 0.08 -0.08');
    gunContainer.appendChild(sight);
    
    // Front sight
    const frontSight = document.createElement('a-entity');
    frontSight.setAttribute('geometry', 'primitive: box; width: 0.01; height: 0.025; depth: 0.005');
    frontSight.setAttribute('material', 'color: #ff6b35; emissive: #ff6b35; emissiveIntensity: 0.3');
    frontSight.setAttribute('position', '0 0.08 -0.25');
    gunContainer.appendChild(frontSight);
    
    // Tactical light
    const tacticalLight = document.createElement('a-entity');
    tacticalLight.setAttribute('geometry', 'primitive: cylinder; radius: 0.015; height: 0.04');
    tacticalLight.setAttribute('material', 'color: #1a1a1a; metalness: 0.9; roughness: 0.1');
    tacticalLight.setAttribute('position', '0 -0.02 -0.18');
    tacticalLight.setAttribute('rotation', '90 0 0');
    
    // Light beam
    const lightBeam = document.createElement('a-entity');
    lightBeam.setAttribute('light', 'type: spot; intensity: 0.5; color: #ffffff; angle: 15; penumbra: 0.1; distance: 8; decay: 1');
    lightBeam.setAttribute('position', '0 0 -0.02');
    lightBeam.setAttribute('rotation', '-90 0 0');
    tacticalLight.appendChild(lightBeam);
    gunContainer.appendChild(tacticalLight);
    this.tacticalLight = lightBeam;
    
    // Laser sight
    const laser = document.createElement('a-entity');
    laser.setAttribute('geometry', 'primitive: cylinder; radius: 0.001; height: 5');
    laser.setAttribute('material', 'color: #ff0000; emissive: #ff0000; emissiveIntensity: 0.8; opacity: 0.6; transparent: true');
    laser.setAttribute('position', '0.02 -0.01 -2.5');
    laser.setAttribute('rotation', '90 0 0');
    laser.setAttribute('visible', 'false');
    gunContainer.appendChild(laser);
    this.laserSight = laser;
    
    // Add to hand
    this.el.appendChild(gunContainer);
    this.gunModel = gunContainer;
    
    // Create muzzle flash effect
    this.createMuzzleFlash();
  },
  
  createMuzzleFlash() {
    const muzzleFlash = document.createElement('a-entity');
    muzzleFlash.setAttribute('geometry', 'primitive: plane; width: 0.3; height: 0.3');
    muzzleFlash.setAttribute('material', 'color: #ffff88; emissive: #ffaa00; emissiveIntensity: 1; opacity: 0; transparent: true; side: double');
    muzzleFlash.setAttribute('position', '0 0 -0.35');
    muzzleFlash.setAttribute('visible', 'false');
    this.gunModel.appendChild(muzzleFlash);
    this.muzzleFlash = muzzleFlash;
  },
  
  createAudioElements() {
    // Gun sound effects (using Web Audio API would be better, but this is simpler)
    this.sounds = {
      shoot: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJcuN/1wX8nCS2IzfDjhT0KHHK57oNsFhMj'),
      reload: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJcuN/1wX8nCS2IzfDjhT0KHHK57oNsFhMj'),
      empty: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBzJcuN/1wX8nCS2IzfDjhT0KHHK57oNsFhMj')
    };
  },
  
  updateUI() {
    const ammoText = `Ammo ${this.magazine}/${this.reserve}`;
    const hpText = `HP ${Game.hp}`;
    document.getElementById('hudAmmo').textContent = ammoText;
    document.getElementById('hudHP').textContent = hpText;
  },
  
  shoot() {
    if (!this.canShoot || this.isReloading || this.safetyOn) return;
    
    if (this.magazine <= 0) {
      this.playEmptySound();
      return;
    }
    
    this.canShoot = false;
    this.magazine--;
    this.updateUI();
    
    // Trigger animation
    this.animateTrigger();
    
    // Muzzle flash
    this.showMuzzleFlash();
    
    // Play shoot sound
    this.playShootSound();
    
    // Gun recoil
    this.animateRecoil();
    
    // Raycasting for hit detection
    this.performRaycast();
    
    // Shell ejection effect
    this.ejectShell();
    
    // Cooldown
    setTimeout(() => {
      this.canShoot = true;
    }, 120);
  },
  
  performRaycast() {
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    
    this.el.object3D.getWorldPosition(origin);
    this.el.object3D.getWorldDirection(direction);
    direction.normalize();
    
    this.raycaster.set(origin, direction);
    const hits = this.raycaster.intersectObjects(this.enemies, true);
    
    if (hits.length > 0) {
      let targetObject = hits[0].object;
      
      // Traverse up to find the entity
      while (targetObject && !targetObject.el) {
        targetObject = targetObject.parent;
      }
      
      if (targetObject && targetObject.el && targetObject.el.components.zombie) {
        const zombie = targetObject.el.components.zombie;
        const isHeadshot = this.isHeadshot(targetObject, zombie);
        
        const damage = Game.powerups.instakill ? 10 : 1;
        zombie.takeDamage(damage, isHeadshot);
        
        const points = isHeadshot ? 30 : 15; // Increased points
        Game.addScore(points);
        
        // Hit effect
        this.createHitEffect(hits[0].point, isHeadshot);
      }
    }
  },
  
  isHeadshot(hitObject, zombie) {
    // Check if hit object is part of the head
    return hitObject === zombie.headEl?.object3D || 
           (zombie.headEl?.object3D.children && 
            zombie.headEl.object3D.children.includes(hitObject));
  },
  
  createHitEffect(position, isHeadshot) {
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: sphere; radius: 0.05');
    effect.setAttribute('material', `color: ${isHeadshot ? '#ff0000' : '#ffff00'}; emissive: ${isHeadshot ? '#ff0000' : '#ffff00'}; emissiveIntensity: 0.8`);
    effect.setAttribute('position', `${position.x} ${position.y} ${position.z}`);
    effect.setAttribute('animation', 'property: scale; to: 2 2 2; dur: 200');
    effect.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 200');
    
    document.querySelector('a-scene').appendChild(effect);
    setTimeout(() => effect.remove(), 200);
  },
  
  animateTrigger() {
    if (this.trigger) {
      this.trigger.setAttribute('animation', 'property: rotation; to: 15 0 0; dur: 50');
      setTimeout(() => {
        this.trigger.setAttribute('animation', 'property: rotation; to: 0 0 0; dur: 80');
      }, 50);
    }
  },
  
  showMuzzleFlash() {
    if (this.muzzleFlash) {
      this.muzzleFlash.setAttribute('visible', 'true');
      this.muzzleFlash.setAttribute('material', 'opacity: 0.8');
      this.muzzleFlash.setAttribute('animation', 'property: material.opacity; to: 0; dur: 100');
      
      setTimeout(() => {
        this.muzzleFlash.setAttribute('visible', 'false');
      }, 100);
    }
  },
  
  animateRecoil() {
    const originalPos = this.gunModel.getAttribute('position');
    this.gunModel.setAttribute('animation', 'property: position; to: 0 -0.1 -0.1; dur: 50');
    this.gunModel.setAttribute('animation__rotation', 'property: rotation; to: -5 0 0; dur: 50');
    
    setTimeout(() => {
      this.gunModel.setAttribute('animation', `property: position; to: ${originalPos.x} ${originalPos.y} ${originalPos.z}; dur: 100`);
      this.gunModel.setAttribute('animation__rotation', 'property: rotation; to: 0 0 0; dur: 100');
    }, 50);
  },
  
  ejectShell() {
    const shell = document.createElement('a-entity');
    shell.setAttribute('geometry', 'primitive: cylinder; radius: 0.008; height: 0.015');
    shell.setAttribute('material', 'color: #ffcc00; metalness: 0.8; roughness: 0.2');
    shell.setAttribute('position', '0.05 0 -0.05');
    shell.setAttribute('animation', 'property: position; to: 0.3 -0.5 0.2; dur: 800; easing: easeOutQuad');
    shell.setAttribute('animation__rotation', 'property: rotation; to: 180 360 180; dur: 800');
    
    this.gunModel.appendChild(shell);
    setTimeout(() => shell.remove(), 1000);
  },
  
  reload() {
    if (this.isReloading) return;
    
    const needed = this.maxMag - this.magazine;
    if (needed <= 0 || this.reserve <= 0) return;
    
    this.isReloading = true;
    
    // Reload animation
    this.animateReload();
    
    // Play reload sound
    this.playReloadSound();
    
    setTimeout(() => {
      const ammoToTake = Math.min(needed, this.reserve);
      this.magazine += ammoToTake;
      this.reserve -= ammoToTake;
      this.updateUI();
      this.isReloading = false;
    }, 1500); // Realistic reload time
  },
  
  animateReload() {
    if (this.magazine_model) {
      // Magazine drop animation
      this.magazine_model.setAttribute('animation', 'property: position; to: 0 -0.3 0.05; dur: 500');
      this.magazine_model.setAttribute('animation__rotation', 'property: rotation; to: 0 0 45; dur: 500');
      
      setTimeout(() => {
        // Magazine insert animation
        this.magazine_model.setAttribute('animation', 'property: position; to: 0 -0.08 0.05; dur: 800; easing: easeOutBounce');
        this.magazine_model.setAttribute('animation__rotation', 'property: rotation; to: 0 0 0; dur: 800');
      }, 600);
    }
  },
  
  toggleSafety() {
    this.safetyOn = !this.safetyOn;
    // Visual indicator for safety
    const color = this.safetyOn ? '#ff0000' : '#00ff00';
    // Could add a safety indicator light here
  },
  
  toggleLaser() {
    if (this.laserSight) {
      const visible = this.laserSight.getAttribute('visible');
      this.laserSight.setAttribute('visible', !visible);
    }
  },
  
  playShootSound() {
    try {
      this.sounds.shoot.currentTime = 0;
      this.sounds.shoot.volume = 0.3;
      this.sounds.shoot.play();
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  },
  
  playReloadSound() {
    try {
      this.sounds.reload.currentTime = 0;
      this.sounds.reload.volume = 0.2;
      this.sounds.reload.play();
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  },
  
  playEmptySound() {
    try {
      this.sounds.empty.currentTime = 0;
      this.sounds.empty.volume = 0.1;
      this.sounds.empty.play();
    } catch (e) {
      console.log('Audio play failed:', e);
    }
  }
});
