// Enhanced Realistic Zombie Component
AFRAME.registerComponent('zombie', {
  schema: {
    speed: { default: 0.6 },
    hp: { default: 4 },
    zombieType: { default: 'male' } // male, female, child
  },
  
  init() {
    this.player = document.querySelector('#player').object3D;
    this.tmp = new THREE.Vector3();
    this.dead = false;
    this.t = 0;
    this.attackCooldown = 0;
    this.el.classList.add('enemy');
    
    // Create detailed zombie model
    this.createZombieModel();
    
    // Animation variables
    this.walkCycle = 0;
    this.groanTimer = Math.random() * 5000; // Random groaning
    
    // Physics
    this.velocity = new THREE.Vector3();
    this.acceleration = new THREE.Vector3();
  },
  
  createZombieModel() {
    const type = this.data.zombieType;
    const variations = this.getZombieVariations(type);
    
    // Main body container
    const body = document.createElement('a-entity');
    body.setAttribute('id', 'zombieBody');
    
    // Head with detailed features
    const head = this.createHead(variations);
    body.appendChild(head);
    this.headEl = head;
    
    // Torso with clothing
    const torso = this.createTorso(variations);
    body.appendChild(torso);
    this.torso = torso;
    
    // Arms with sleeves
    const leftArm = this.createArm('left', variations);
    const rightArm = this.createArm('right', variations);
    body.appendChild(leftArm);
    body.appendChild(rightArm);
    this.armL = leftArm;
    this.armR = rightArm;
    
    // Legs with pants
    const leftLeg = this.createLeg('left', variations);
    const rightLeg = this.createLeg('right', variations);
    body.appendChild(leftLeg);
    body.appendChild(rightLeg);
    this.legL = leftLeg;
    this.legR = rightLeg;
    
    // Add to zombie entity
    this.el.appendChild(body);
    
    // Add shadow
    this.el.setAttribute('shadow', 'cast: true; receive: false');
  },
  
  getZombieVariations(type) {
    const variations = {
      male: {
        skinColor: ['#d4a574', '#c49969', '#b8865d', '#a67c52'][Math.floor(Math.random() * 4)],
        shirtColor: ['#2c3e50', '#34495e', '#7f8c8d', '#95a5a6', '#8b4513'][Math.floor(Math.random() * 5)],
        pantsColor: ['#2c3e50', '#34495e', '#8b4513', '#654321'][Math.floor(Math.random() * 4)],
        hairColor: ['#3c2414', '#8b4513', '#654321', '#2f1b14'][Math.floor(Math.random() * 4)],
        height: 1.7 + Math.random() * 0.3,
        build: 0.8 + Math.random() * 0.4
      },
      female: {
        skinColor: ['#d4a574', '#c49969', '#b8865d', '#a67c52'][Math.floor(Math.random() * 4)],
        shirtColor: ['#e74c3c', '#9b59b6', '#3498db', '#2ecc71', '#f39c12'][Math.floor(Math.random() * 5)],
        pantsColor: ['#2c3e50', '#8b4513', '#654321', '#4a4a4a'][Math.floor(Math.random() * 4)],
        hairColor: ['#3c2414', '#8b4513', '#654321', '#2f1b14', '#8b0000'][Math.floor(Math.random() * 5)],
        height: 1.6 + Math.random() * 0.25,
        build: 0.7 + Math.random() * 0.3
      }
    };
    return variations[type] || variations.male;
  },
  
  createHead(variations) {
    const head = document.createElement('a-entity');
    head.setAttribute('position', '0 1.85 0');
    
    // Skull
    const skull = document.createElement('a-entity');
    skull.setAttribute('geometry', 'primitive: box; width: 0.35; height: 0.4; depth: 0.3');
    skull.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.8`);
    skull.setAttribute('position', '0 0 0');
    head.appendChild(skull);
    
    // Hair
    const hair = document.createElement('a-entity');
    hair.setAttribute('geometry', 'primitive: box; width: 0.38; height: 0.15; depth: 0.32');
    hair.setAttribute('material', `color: ${variations.hairColor}; roughness: 0.9`);
    hair.setAttribute('position', '0 0.2 0');
    head.appendChild(hair);
    
    // Eyes (glowing red)
    const leftEye = document.createElement('a-entity');
    leftEye.setAttribute('geometry', 'primitive: sphere; radius: 0.04');
    leftEye.setAttribute('material', 'color: #ff0000; emissive: #ff0000; emissiveIntensity: 0.5');
    leftEye.setAttribute('position', '-0.08 0.05 0.16');
    head.appendChild(leftEye);
    
    const rightEye = document.createElement('a-entity');
    rightEye.setAttribute('geometry', 'primitive: sphere; radius: 0.04');
    rightEye.setAttribute('material', 'color: #ff0000; emissive: #ff0000; emissiveIntensity: 0.5');
    rightEye.setAttribute('position', '0.08 0.05 0.16');
    head.appendChild(rightEye);
    
    // Mouth
    const mouth = document.createElement('a-entity');
    mouth.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.03; depth: 0.02');
    mouth.setAttribute('material', 'color: #2c1810');
    mouth.setAttribute('position', '0 -0.08 0.16');
    head.appendChild(mouth);
    
    // Nose
    const nose = document.createElement('a-entity');
    nose.setAttribute('geometry', 'primitive: box; width: 0.03; height: 0.06; depth: 0.04');
    nose.setAttribute('material', `color: ${variations.skinColor}`);
    nose.setAttribute('position', '0 0 0.17');
    head.appendChild(nose);
    
    return head;
  },
  
  createTorso(variations) {
    const torso = document.createElement('a-entity');
    torso.setAttribute('position', '0 1.2 0');
    
    // Body
    const body = document.createElement('a-entity');
    body.setAttribute('geometry', `primitive: box; width: ${0.6 * variations.build}; height: 0.8; depth: 0.3`);
    body.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.8`);
    torso.appendChild(body);
    
    // Shirt
    const shirt = document.createElement('a-entity');
    shirt.setAttribute('geometry', `primitive: box; width: ${0.62 * variations.build}; height: 0.82; depth: 0.32`);
    shirt.setAttribute('material', `color: ${variations.shirtColor}; roughness: 0.7`);
    shirt.setAttribute('position', '0 0 0');
    torso.appendChild(shirt);
    
    // Add some wear and tear
    const tear1 = document.createElement('a-entity');
    tear1.setAttribute('geometry', 'primitive: box; width: 0.08; height: 0.15; depth: 0.01');
    tear1.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.9`);
    tear1.setAttribute('position', `${0.2 * variations.build} 0.1 0.16`);
    torso.appendChild(tear1);
    
    return torso;
  },
  
  createArm(side, variations) {
    const arm = document.createElement('a-entity');
    const x = side === 'left' ? -0.4 * variations.build : 0.4 * variations.build;
    arm.setAttribute('position', `${x} 1.1 0`);
    
    // Upper arm
    const upperArm = document.createElement('a-entity');
    upperArm.setAttribute('geometry', 'primitive: box; width: 0.15; height: 0.4; depth: 0.15');
    upperArm.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.8`);
    upperArm.setAttribute('position', '0 0.1 0');
    arm.appendChild(upperArm);
    
    // Sleeve
    const sleeve = document.createElement('a-entity');
    sleeve.setAttribute('geometry', 'primitive: box; width: 0.17; height: 0.25; depth: 0.17');
    sleeve.setAttribute('material', `color: ${variations.shirtColor}; roughness: 0.7`);
    sleeve.setAttribute('position', '0 0.15 0');
    arm.appendChild(sleeve);
    
    // Forearm
    const forearm = document.createElement('a-entity');
    forearm.setAttribute('geometry', 'primitive: box; width: 0.13; height: 0.35; depth: 0.13');
    forearm.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.8`);
    forearm.setAttribute('position', '0 -0.25 0');
    arm.appendChild(forearm);
    
    // Hand
    const hand = document.createElement('a-entity');
    hand.setAttribute('geometry', 'primitive: box; width: 0.12; height: 0.15; depth: 0.08');
    hand.setAttribute('material', `color: ${variations.skinColor}; roughness: 0.9`);
    hand.setAttribute('position', '0 -0.45 0');
    arm.appendChild(hand);
    
    return arm;
  },
  
  createLeg(side, variations) {
    const leg = document.createElement('a-entity');
    const x = side === 'left' ? -0.15 : 0.15;
    leg.setAttribute('position', `${x} 0.4 0`);
    
    // Thigh
    const thigh = document.createElement('a-entity');
    thigh.setAttribute('geometry', 'primitive: box; width: 0.18; height: 0.5; depth: 0.18');
    thigh.setAttribute('material', `color: ${variations.pantsColor}; roughness: 0.8`);
    thigh.setAttribute('position', '0 0.15 0');
    leg.appendChild(thigh);
    
    // Shin
    const shin = document.createElement('a-entity');
    shin.setAttribute('geometry', 'primitive: box; width: 0.16; height: 0.45; depth: 0.16');
    shin.setAttribute('material', `color: ${variations.pantsColor}; roughness: 0.8`);
    shin.setAttribute('position', '0 -0.3 0');
    leg.appendChild(shin);
    
    // Foot
    const foot = document.createElement('a-entity');
    foot.setAttribute('geometry', 'primitive: box; width: 0.14; height: 0.08; depth: 0.25');
    foot.setAttribute('material', 'color: #2c1810; roughness: 0.9');
    foot.setAttribute('position', '0 -0.58 0.08');
    leg.appendChild(foot);
    
    return foot;
  },
  
  takeDamage(damage = 1, isHeadshot = false) {
    if (this.dead) return;
    
    const actualDamage = isHeadshot ? damage * 2 : damage;
    this.data.hp -= actualDamage;
    
    // Blood effect
    this.createBloodEffect();
    
    if (this.data.hp <= 0) {
      this.dead = true;
      this.die();
    }
  },
  
  createBloodEffect() {
    const blood = document.createElement('a-entity');
    blood.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
    blood.setAttribute('material', 'color: #8b0000; opacity: 0.8; transparent: true');
    blood.setAttribute('position', `${Math.random() * 0.4 - 0.2} ${1.5 + Math.random() * 0.5} ${Math.random() * 0.2}`);
    blood.setAttribute('animation', 'property: scale; to: 0 0 0; dur: 1000; easing: easeOutQuad');
    blood.setAttribute('animation__opacity', 'property: material.opacity; to: 0; dur: 1000');
    this.el.appendChild(blood);
    
    setTimeout(() => blood.remove(), 1000);
  },
  
  die() {
    // Death animation
    this.el.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 800; easing: easeOutQuad');
    this.el.setAttribute('animation__fall', 'property: position; to: 0 -0.5 0; dur: 800; easing: easeOutBounce');
    
    this.el.emit('zombie-killed');
    
    setTimeout(() => {
      this.el.remove();
    }, 2000);
  },
  
  tick(time, deltaTime) {
    if (this.dead) return;
    
    this.t += deltaTime / 1000;
    const speed = this.data.speed * (deltaTime / 1000);
    
    // Get player position
    const playerPos = this.player.getWorldPosition(this.tmp);
    const myPos = this.el.object3D.position;
    
    // Calculate direction to player
    const direction = this.tmp.set(playerPos.x - myPos.x, 0, playerPos.z - myPos.z);
    const distance = direction.length();
    
    if (distance > 0.001) {
      direction.normalize();
      
      // Move towards player
      myPos.addScaledVector(direction, speed);
      
      // Face player
      const yaw = Math.atan2(direction.x, direction.z) * THREE.MathUtils.RAD2DEG;
      this.el.setAttribute('rotation', `0 ${yaw} 0`);
    }
    
    // Walking animation
    this.animateWalk();
    
    // Groaning sound effect (emit event for audio system)
    this.groanTimer -= deltaTime;
    if (this.groanTimer <= 0) {
      this.el.emit('zombie-groan');
      this.groanTimer = 3000 + Math.random() * 4000;
    }
    
    // Attack player if close enough
    if (distance < 0.8) {
      this.attackCooldown -= deltaTime;
      if (this.attackCooldown <= 0) {
        this.el.emit('zombie-hit-player');
        this.attackCooldown = 1000; // 1 second cooldown
      }
    }
  },
  
  animateWalk() {
    const walkSpeed = 4;
    const armSwing = 0.5;
    const legSwing = 0.7;
    
    this.walkCycle += 0.05;
    
    // Arm swinging (opposite to legs)
    if (this.armL && this.armR) {
      this.armL.object3D.rotation.z = armSwing * Math.sin(this.walkCycle);
      this.armR.object3D.rotation.z = -armSwing * Math.sin(this.walkCycle);
      this.armL.object3D.rotation.x = armSwing * 0.3 * Math.cos(this.walkCycle);
      this.armR.object3D.rotation.x = -armSwing * 0.3 * Math.cos(this.walkCycle);
    }
    
    // Leg walking
    if (this.legL && this.legR) {
      this.legL.object3D.rotation.x = legSwing * Math.sin(this.walkCycle + Math.PI);
      this.legR.object3D.rotation.x = legSwing * Math.sin(this.walkCycle);
    }
    
    // Slight bobbing
    if (this.torso) {
      this.torso.object3D.position.y = 1.2 + 0.05 * Math.sin(this.walkCycle * 2);
    }
    
    // Head sway
    if (this.headEl) {
      this.headEl.object3D.rotation.z = 0.1 * Math.sin(this.walkCycle * 0.8);
    }
  }
});
