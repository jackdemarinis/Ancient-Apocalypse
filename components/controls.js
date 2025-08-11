// Enhanced VR Controls for Meta Quest 3
AFRAME.registerComponent('vr-controls', {
  init() {
    this.rig = this.el;
    this.camera = this.rig.querySelector('#player');
    this.leftController = null;
    this.rightController = null;
    
    // Movement state
    this.moveVector = new THREE.Vector3();
    this.isSprinting = false;
    this.sprintMultiplier = 2.0;
    this.baseSpeed = 0.18;
    
    // Teleportation
    this.teleportRay = null;
    this.teleportMarker = null;
    this.isTeleporting = false;
    
    // Setup after controllers are connected
    setTimeout(() => {
      this.setupControllers();
      this.createTeleportSystem();
    }, 1000);
    
    // Keyboard fallback for desktop testing
    this.setupKeyboardControls();
  },
  
  setupControllers() {
    this.leftController = document.querySelector('#leftHand');
    this.rightController = document.querySelector('#rightHand');
    
    if (this.leftController) {
      // Left controller events
      this.leftController.addEventListener('thumbstickmoved', (evt) => {
        this.handleMovement(evt.detail);
      });
      
      this.leftController.addEventListener('thumbstickdown', () => {
        this.toggleSprint();
      });
      
      this.leftController.addEventListener('xbuttondown', () => {
        this.startTeleport();
      });
      
      this.leftController.addEventListener('xbuttonup', () => {
        this.endTeleport();
      });
      
      this.leftController.addEventListener('ybuttondown', () => {
        this.restartGame();
      });
      
      this.leftController.addEventListener('gripdown', () => {
        this.toggleFlashlight();
      });
    }
    
    if (this.rightController) {
      // Right controller events (gun handled in gun component)
      this.rightController.addEventListener('thumbstickmoved', (evt) => {
        this.handleTurning(evt.detail);
      });
      
      this.rightController.addEventListener('thumbstickdown', () => {
        this.toggleLaser();
      });
      
      this.rightController.addEventListener('gripdown', () => {
        this.meleeAttack();
      });
    }
  },
  
  handleMovement(detail) {
    const { x, y } = detail;
    const threshold = 0.1;
    
    if (Math.abs(x) < threshold && Math.abs(y) < threshold) {
      this.moveVector.set(0, 0, 0);
      return;
    }
    
    // Calculate movement relative to camera direction
    const cameraRotation = this.camera.object3D.rotation.y;
    const speed = this.isSprinting ? this.baseSpeed * this.sprintMultiplier : this.baseSpeed;
    
    // Forward/backward movement
    const forward = -y * speed;
    const strafe = x * speed;
    
    // Apply camera rotation
    this.moveVector.set(
      strafe * Math.cos(cameraRotation) - forward * Math.sin(cameraRotation),
      0,
      strafe * Math.sin(cameraRotation) + forward * Math.cos(cameraRotation)
    );
  },
  
  handleTurning(detail) {
    const { x } = detail;
    const threshold = 0.2;
    const turnSpeed = 2.0; // degrees per frame
    
    if (Math.abs(x) > threshold) {
      const currentRotation = this.rig.getAttribute('rotation');
      const newY = currentRotation.y + (x * turnSpeed);
      this.rig.setAttribute('rotation', `${currentRotation.x} ${newY} ${currentRotation.z}`);
    }
  },
  
  toggleSprint() {
    this.isSprinting = !this.isSprinting;
    
    // Visual feedback for sprinting
    const hud = document.getElementById('hudPowers');
    if (this.isSprinting) {
      const currentText = hud.textContent;
      hud.textContent = currentText === '—' ? 'Sprint' : currentText + ' • Sprint';
    } else {
      const currentText = hud.textContent;
      hud.textContent = currentText.replace(' • Sprint', '').replace('Sprint • ', '').replace('Sprint', '—');
    }
  },
  
  createTeleportSystem() {
    // Create teleport ray
    const ray = document.createElement('a-entity');
    ray.setAttribute('geometry', 'primitive: cylinder; radius: 0.005; height: 5');
    ray.setAttribute('material', 'color: #00ff00; emissive: #00ff00; emissiveIntensity: 0.5; opacity: 0.7; transparent: true');
    ray.setAttribute('position', '0 0 -2.5');
    ray.setAttribute('rotation', '90 0 0');
    ray.setAttribute('visible', 'false');
    
    if (this.leftController) {
      this.leftController.appendChild(ray);
      this.teleportRay = ray;
    }
    
    // Create teleport marker
    const marker = document.createElement('a-entity');
    marker.setAttribute('geometry', 'primitive: cylinder; radius: 0.5; height: 0.05');
    marker.setAttribute('material', 'color: #00ff00; emissive: #00ff00; emissiveIntensity: 0.3; opacity: 0.7; transparent: true');
    marker.setAttribute('visible', 'false');
    marker.setAttribute('animation', 'property: rotation; to: 0 360 0; dur: 2000; loop: true');
    
    document.querySelector('a-scene').appendChild(marker);
    this.teleportMarker = marker;
  },
  
  startTeleport() {
    if (!this.teleportRay || this.isTeleporting) return;
    
    this.isTeleporting = true;
    this.teleportRay.setAttribute('visible', 'true');
    
    // Raycast to find teleport position
    this.updateTeleportTarget();
  },
  
  updateTeleportTarget() {
    if (!this.isTeleporting || !this.leftController) return;
    
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, -1, 0);
    
    this.leftController.object3D.getWorldPosition(origin);
    this.leftController.object3D.getWorldDirection(direction);
    
    raycaster.set(origin, direction);
    
    // Raycast against the floor
    const floor = document.querySelector('a-scene').querySelectorAll('[geometry]');
    const intersects = raycaster.intersectObjects([...floor].map(el => el.object3D), true);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      this.teleportMarker.setAttribute('position', `${point.x} ${point.y + 0.025} ${point.z}`);
      this.teleportMarker.setAttribute('visible', 'true');
    } else {
      this.teleportMarker.setAttribute('visible', 'false');
    }
  },
  
  endTeleport() {
    if (!this.isTeleporting) return;
    
    this.isTeleporting = false;
    this.teleportRay.setAttribute('visible', 'false');
    
    if (this.teleportMarker.getAttribute('visible')) {
      const markerPos = this.teleportMarker.getAttribute('position');
      const currentPos = this.rig.getAttribute('position');
      
      // Teleport to marker position
      this.rig.setAttribute('position', `${markerPos.x} ${currentPos.y} ${markerPos.z}`);
      
      // Teleport effect
      this.createTeleportEffect(markerPos);
    }
    
    this.teleportMarker.setAttribute('visible', 'false');
  },
  
  createTeleportEffect(position) {
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: ring; radiusInner: 0.3; radiusOuter: 1.0');
    effect.setAttribute('material', 'color: #00ff00; emissive: #00ff00; emissiveIntensity: 0.8; opacity: 0.8; transparent: true; side: double');
    effect.setAttribute('position', `${position.x} ${position.y + 0.1} ${position.z}`);
    effect.setAttribute('rotation', '90 0 0');
    effect.setAttribute('animation', 'property: scale; to: 2 2 2; dur: 500; easing: easeOutQuad');
    effect.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 500');
    
    document.querySelector('a-scene').appendChild(effect);
    setTimeout(() => effect.remove(), 500);
  },
  
  restartGame() {
    // VR-friendly restart
    if (Game.state === 'gameover' || Game.state === 'playing') {
      // Show confirmation in VR
      this.showVRConfirmation('Restart Game?', () => {
        location.reload();
      });
    }
  },
  
  showVRConfirmation(message, callback) {
    const confirmation = document.createElement('a-entity');
    confirmation.setAttribute('position', '0 2 -2');
    confirmation.setAttribute('geometry', 'primitive: plane; width: 2; height: 1');
    confirmation.setAttribute('material', 'color: #1a1a2e; opacity: 0.9; transparent: true');
    
    const text = document.createElement('a-entity');
    text.setAttribute('text', `value: ${message}\\nA = Yes | B = No; align: center; color: white; width: 8`);
    text.setAttribute('position', '0 0.2 0.01');
    confirmation.appendChild(text);
    
    // Temporary event listeners
    const confirmHandler = () => {
      callback();
      cleanup();
    };
    
    const cancelHandler = () => {
      cleanup();
    };
    
    const cleanup = () => {
      if (this.leftController) {
        this.leftController.removeEventListener('abuttondown', confirmHandler);
        this.leftController.removeEventListener('bbuttondown', cancelHandler);
      }
      confirmation.remove();
    };
    
    if (this.leftController) {
      this.leftController.addEventListener('abuttondown', confirmHandler);
      this.leftController.addEventListener('bbuttondown', cancelHandler);
    }
    
    document.querySelector('a-scene').appendChild(confirmation);
    
    // Auto-remove after 5 seconds
    setTimeout(cleanup, 5000);
  },
  
  toggleFlashlight() {
    const flashlight = document.querySelector('#tacticalLight');
    if (flashlight) {
      const light = flashlight.querySelector('[light]');
      if (light) {
        const currentIntensity = light.getAttribute('light').intensity;
        light.setAttribute('light', `intensity: ${currentIntensity > 0 ? 0 : 0.5}`);
      }
    }
  },
  
  toggleLaser() {
    const gun = this.rightController?.components?.gun;
    if (gun && gun.toggleLaser) {
      gun.toggleLaser();
    }
  },
  
  meleeAttack() {
    // Quick melee attack for close combat
    const raycaster = new THREE.Raycaster();
    const origin = new THREE.Vector3();
    const direction = new THREE.Vector3(0, 0, -1);
    
    this.rightController.object3D.getWorldPosition(origin);
    this.rightController.object3D.getWorldDirection(direction);
    
    raycaster.set(origin, direction);
    raycaster.far = 1.5; // Short range for melee
    
    const enemies = [...document.querySelectorAll('.enemy')].map(e => e.object3D);
    const hits = raycaster.intersectObjects(enemies, true);
    
    if (hits.length > 0) {
      let targetObject = hits[0].object;
      while (targetObject && !targetObject.el) {
        targetObject = targetObject.parent;
      }
      
      if (targetObject && targetObject.el && targetObject.el.components.zombie) {
        const zombie = targetObject.el.components.zombie;
        zombie.takeDamage(2, false); // Melee damage
        Game.addScore(5);
        
        // Melee effect
        this.createMeleeEffect();
      }
    }
  },
  
  createMeleeEffect() {
    // Controller vibration effect (if supported)
    if (this.rightController && this.rightController.components['hand-controls']) {
      // Haptic feedback would go here
    }
    
    // Visual effect
    const effect = document.createElement('a-entity');
    effect.setAttribute('geometry', 'primitive: sphere; radius: 0.2');
    effect.setAttribute('material', 'color: #ffff00; emissive: #ffff00; emissiveIntensity: 1; opacity: 0.7; transparent: true');
    effect.setAttribute('position', '0 0 -0.5');
    effect.setAttribute('animation', 'property: scale; to: 2 2 2; dur: 200');
    effect.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 200');
    
    this.rightController.appendChild(effect);
    setTimeout(() => effect.remove(), 200);
  },
  
  setupKeyboardControls() {
    // Fallback keyboard controls for desktop testing
    this.keys = {};
    
    window.addEventListener('keydown', (evt) => {
      this.keys[evt.code] = true;
      
      switch(evt.code) {
        case 'KeyR':
          this.restartGame();
          break;
        case 'ShiftLeft':
          this.isSprinting = true;
          break;
        case 'KeyF':
          this.toggleFlashlight();
          break;
        case 'KeyL':
          this.toggleLaser();
          break;
      }
    });
    
    window.addEventListener('keyup', (evt) => {
      this.keys[evt.code] = false;
      
      if (evt.code === 'ShiftLeft') {
        this.isSprinting = false;
      }
    });
  },
  
  tick(time, deltaTime) {
    // Apply movement
    if (this.moveVector.length() > 0) {
      const currentPos = this.rig.getAttribute('position');
      const newPos = {
        x: currentPos.x + this.moveVector.x,
        y: currentPos.y,
        z: currentPos.z + this.moveVector.z
      };
      
      // Boundary checking (keep player in house area)
      newPos.x = Math.max(-5.5, Math.min(5.5, newPos.x));
      newPos.z = Math.max(-5.5, Math.min(5.5, newPos.z));
      
      this.rig.setAttribute('position', newPos);
    }
    
    // Update teleport target while teleporting
    if (this.isTeleporting) {
      this.updateTeleportTarget();
    }
    
    // Keyboard movement (desktop fallback)
    if (this.keys['KeyW'] || this.keys['KeyS'] || this.keys['KeyA'] || this.keys['KeyD']) {
      const moveSpeed = this.isSprinting ? this.baseSpeed * this.sprintMultiplier : this.baseSpeed;
      const currentPos = this.rig.getAttribute('position');
      
      if (this.keys['KeyW']) currentPos.z -= moveSpeed;
      if (this.keys['KeyS']) currentPos.z += moveSpeed;
      if (this.keys['KeyA']) currentPos.x -= moveSpeed;
      if (this.keys['KeyD']) currentPos.x += moveSpeed;
      
      this.rig.setAttribute('position', currentPos);
    }
  }
});
