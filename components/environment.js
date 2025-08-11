// Enhanced Environment with Detailed Props and Textures
AFRAME.registerComponent('detailed-environment', {
  init() {
    this.createDetailedHouse();
    this.createInteriorProps();
    this.createExteriorEnvironment();
    this.createAtmosphericEffects();
  },
  
  createDetailedHouse() {
    const house = document.querySelector('#house') || document.createElement('a-entity');
    house.setAttribute('id', 'house');
    
    // Remove old simple house elements
    while (house.firstChild) {
      house.removeChild(house.firstChild);
    }
    
    // Enhanced floor with wood texture pattern
    const floor = document.createElement('a-entity');
    floor.setAttribute('geometry', 'primitive: box; depth: 12; width: 12; height: 0.2');
    floor.setAttribute('material', 'color: #3c2415; roughness: 0.8; metalness: 0.1');
    floor.setAttribute('position', '0 -0.1 0');
    floor.setAttribute('shadow', 'receive: true');
    house.appendChild(floor);
    
    // Add wood planks effect
    for (let i = 0; i < 12; i++) {
      const plank = document.createElement('a-entity');
      plank.setAttribute('geometry', 'primitive: box; width: 12; height: 0.01; depth: 0.8');
      plank.setAttribute('material', `color: ${i % 2 === 0 ? '#4a2c1a' : '#3c2415'}; roughness: 0.9`);
      plank.setAttribute('position', `0 0.005 ${-5.5 + i * 1}`);
      house.appendChild(plank);
    }
    
    // Walls with texture and damage
    this.createWall(house, '0 1.5 -6', '12 3 0.3', '#2a3342', 'back');
    this.createWall(house, '0 1.5 6', '12 3 0.3', '#2a3342', 'front');
    this.createWall(house, '-6 1.5 0', '0.3 3 12', '#263241', 'left');
    this.createWall(house, '6 1.5 0', '0.3 3 12', '#263241', 'right');
    
    // Ceiling with beams
    this.createCeiling(house);
    
    // Windows
    this.createWindows(house);
    
    // Door
    this.createDoor(house);
    
    if (!document.querySelector('#house')) {
      document.querySelector('a-scene').appendChild(house);
    }
  },
  
  createWall(parent, position, dimensions, color, wallType) {
    const wall = document.createElement('a-entity');
    wall.setAttribute('geometry', `primitive: box; width: ${dimensions.split(' ')[0]}; height: ${dimensions.split(' ')[1]}; depth: ${dimensions.split(' ')[2]}`);
    wall.setAttribute('material', `color: ${color}; roughness: 0.9; metalness: 0.1`);
    wall.setAttribute('position', position);
    wall.setAttribute('shadow', 'cast: true; receive: true');
    parent.appendChild(wall);
    
    // Add wall damage/wear
    this.addWallDamage(wall, wallType);
    
    return wall;
  },
  
  addWallDamage(wall, wallType) {
    // Cracks
    const crackCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < crackCount; i++) {
      const crack = document.createElement('a-entity');
      crack.setAttribute('geometry', `primitive: box; width: ${0.05 + Math.random() * 0.1}; height: ${0.3 + Math.random() * 0.8}; depth: 0.01`);
      crack.setAttribute('material', 'color: #1a1a1a; roughness: 1');
      
      const x = (Math.random() - 0.5) * 8;
      const y = Math.random() * 2;
      const z = wallType === 'back' || wallType === 'front' ? 0.16 : 0.16;
      
      crack.setAttribute('position', `${x} ${y} ${z}`);
      crack.setAttribute('rotation', `0 0 ${Math.random() * 30 - 15}`);
      wall.appendChild(crack);
    }
    
    // Stains
    const stainCount = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < stainCount; i++) {
      const stain = document.createElement('a-entity');
      stain.setAttribute('geometry', `primitive: circle; radius: ${0.1 + Math.random() * 0.3}`);
      stain.setAttribute('material', 'color: #2d1810; opacity: 0.6; transparent: true');
      
      const x = (Math.random() - 0.5) * 8;
      const y = 0.5 + Math.random() * 1.5;
      const z = 0.151;
      
      stain.setAttribute('position', `${x} ${y} ${z}`);
      wall.appendChild(stain);
    }
  },
  
  createCeiling(parent) {
    // Main ceiling
    const ceiling = document.createElement('a-entity');
    ceiling.setAttribute('geometry', 'primitive: box; width: 12; height: 0.2; depth: 12');
    ceiling.setAttribute('material', 'color: #1f2937; roughness: 0.8');
    ceiling.setAttribute('position', '0 3.1 0');
    ceiling.setAttribute('shadow', 'receive: true');
    parent.appendChild(ceiling);
    
    // Wooden beams
    const beamPositions = [-4, -2, 0, 2, 4];
    beamPositions.forEach(z => {
      const beam = document.createElement('a-entity');
      beam.setAttribute('geometry', 'primitive: box; width: 12; height: 0.2; depth: 0.3');
      beam.setAttribute('material', 'color: #4b3f2f; roughness: 0.9');
      beam.setAttribute('position', `0 2.9 ${z}`);
      beam.setAttribute('shadow', 'cast: true');
      parent.appendChild(beam);
    });
    
    // Hanging light fixture
    const lightFixture = document.createElement('a-entity');
    lightFixture.setAttribute('geometry', 'primitive: cylinder; radius: 0.3; height: 0.1');
    lightFixture.setAttribute('material', 'color: #8b7355; metalness: 0.3; roughness: 0.7');
    lightFixture.setAttribute('position', '0 2.7 -1');
    
    // Chain
    for (let i = 0; i < 3; i++) {
      const chainLink = document.createElement('a-entity');
      chainLink.setAttribute('geometry', 'primitive: torus; radius: 0.02; radiusTubular: 0.005');
      chainLink.setAttribute('material', 'color: #4a4a4a; metalness: 0.8; roughness: 0.3');
      chainLink.setAttribute('position', `0 ${0.15 + i * 0.08} 0`);
      lightFixture.appendChild(chainLink);
    }
    
    parent.appendChild(lightFixture);
  },
  
  createWindows(parent) {
    // Window frames
    const windowData = [
      { pos: '-3 1.8 -6.1', size: '1.5 1.2 0.1' },
      { pos: '3 1.8 -6.1', size: '1.5 1.2 0.1' },
      { pos: '-6.1 1.8 -2', size: '0.1 1.2 1.5' },
      { pos: '6.1 1.8 2', size: '0.1 1.2 1.5' }
    ];
    
    windowData.forEach(window => {
      // Frame
      const frame = document.createElement('a-entity');
      frame.setAttribute('geometry', `primitive: box; width: ${window.size.split(' ')[0]}; height: ${window.size.split(' ')[1]}; depth: ${window.size.split(' ')[2]}`);
      frame.setAttribute('material', 'color: #4a3f35; roughness: 0.8');
      frame.setAttribute('position', window.pos);
      parent.appendChild(frame);
      
      // Broken glass effect
      const glassShards = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < glassShards; i++) {
        const shard = document.createElement('a-entity');
        const width = 0.2 + Math.random() * 0.4;
        const height = 0.2 + Math.random() * 0.4;
        shard.setAttribute('geometry', `primitive: box; width: ${width}; height: ${height}; depth: 0.01`);
        shard.setAttribute('material', 'color: #87ceeb; opacity: 0.3; transparent: true; metalness: 0.1; roughness: 0.1');
        
        const offsetX = (Math.random() - 0.5) * 1.2;
        const offsetY = (Math.random() - 0.5) * 1.0;
        const basePos = window.pos.split(' ');
        shard.setAttribute('position', `${parseFloat(basePos[0]) + offsetX} ${parseFloat(basePos[1]) + offsetY} ${parseFloat(basePos[2]) + 0.02}`);
        shard.setAttribute('rotation', `0 0 ${Math.random() * 360}`);
        parent.appendChild(shard);
      }
      
      // Boarded up sections
      const boardCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < boardCount; i++) {
        const board = document.createElement('a-entity');
        board.setAttribute('geometry', `primitive: box; width: ${Math.random() > 0.5 ? 1.6 : 0.2}; height: 0.15; depth: 0.05`);
        board.setAttribute('material', 'color: #5d4e37; roughness: 0.9');
        
        const offsetX = (Math.random() - 0.5) * 1.0;
        const offsetY = (Math.random() - 0.5) * 0.8;
        const basePos = window.pos.split(' ');
        board.setAttribute('position', `${parseFloat(basePos[0]) + offsetX} ${parseFloat(basePos[1]) + offsetY} ${parseFloat(basePos[2]) + 0.05}`);
        board.setAttribute('rotation', `0 0 ${Math.random() * 40 - 20}`);
        parent.appendChild(board);
      }
    });
  },
  
  createDoor(parent) {
    // Door frame
    const doorFrame = document.createElement('a-entity');
    doorFrame.setAttribute('geometry', 'primitive: box; width: 1.2; height: 2.2; depth: 0.15');
    doorFrame.setAttribute('material', 'color: #3d2f1f; roughness: 0.8');
    doorFrame.setAttribute('position', '0 1.1 -6.05');
    parent.appendChild(doorFrame);
    
    // Broken door (hanging on hinges)
    const door = document.createElement('a-entity');
    door.setAttribute('geometry', 'primitive: box; width: 1.0; height: 2.0; depth: 0.08');
    door.setAttribute('material', 'color: #2d1f0f; roughness: 0.9');
    door.setAttribute('position', '-0.3 0 0.1');
    door.setAttribute('rotation', '0 -25 0');
    doorFrame.appendChild(door);
    
    // Door handle
    const handle = document.createElement('a-entity');
    handle.setAttribute('geometry', 'primitive: sphere; radius: 0.04');
    handle.setAttribute('material', 'color: #8b7355; metalness: 0.7; roughness: 0.4');
    handle.setAttribute('position', '0.4 0 0.05');
    door.appendChild(handle);
    
    // Damage to door
    const holeCount = 2 + Math.floor(Math.random() * 3);
    for (let i = 0; i < holeCount; i++) {
      const hole = document.createElement('a-entity');
      hole.setAttribute('geometry', `primitive: circle; radius: ${0.05 + Math.random() * 0.1}`);
      hole.setAttribute('material', 'color: #1a1a1a; side: double');
      
      const x = (Math.random() - 0.5) * 0.8;
      const y = (Math.random() - 0.5) * 1.6;
      hole.setAttribute('position', `${x} ${y} 0.041`);
      door.appendChild(hole);
    }
  },
  
  createInteriorProps() {
    const scene = document.querySelector('a-scene');
    
    // Old furniture
    this.createOldTable(scene);
    this.createBrokenChairs(scene);
    this.createBookshelf(scene);
    this.createOldTV(scene);
    this.createDebris(scene);
    this.createBarrels(scene);
    
    // Atmospheric details
    this.createCobwebs(scene);
    this.createDust(scene);
  },
  
  createOldTable(parent) {
    const table = document.createElement('a-entity');
    table.setAttribute('position', '-3 0.4 -2');
    
    // Table top
    const top = document.createElement('a-entity');
    top.setAttribute('geometry', 'primitive: box; width: 2.0; height: 0.1; depth: 1.0');
    top.setAttribute('material', 'color: #5d4e37; roughness: 0.8');
    top.setAttribute('position', '0 0.35 0');
    top.setAttribute('shadow', 'cast: true; receive: true');
    table.appendChild(top);
    
    // Table legs
    const legPositions = [[-0.8, 0, -0.4], [0.8, 0, -0.4], [-0.8, 0, 0.4], [0.8, 0, 0.4]];
    legPositions.forEach(([x, y, z], index) => {
      const leg = document.createElement('a-entity');
      leg.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.7; depth: 0.1');
      leg.setAttribute('material', 'color: #4a3f35; roughness: 0.9');
      leg.setAttribute('position', `${x} ${y} ${z}`);
      
      // Some legs are broken/shorter
      if (index === 2) {
        leg.setAttribute('geometry', 'primitive: box; width: 0.1; height: 0.4; depth: 0.1');
        leg.setAttribute('position', `${x} ${y - 0.15} ${z}`);
        leg.setAttribute('rotation', '0 0 -15');
      }
      
      table.appendChild(leg);
    });
    
    // Items on table
    const bottle = document.createElement('a-entity');
    bottle.setAttribute('geometry', 'primitive: cylinder; radius: 0.03; height: 0.15');
    bottle.setAttribute('material', 'color: #2d4a2d; opacity: 0.7; transparent: true');
    bottle.setAttribute('position', '0.3 0.45 0.2');
    table.appendChild(bottle);
    
    const papers = document.createElement('a-entity');
    papers.setAttribute('geometry', 'primitive: box; width: 0.3; height: 0.01; depth: 0.2');
    papers.setAttribute('material', 'color: #f4f4f4; roughness: 0.8');
    papers.setAttribute('position', '-0.4 0.41 -0.1');
    papers.setAttribute('rotation', '0 15 0');
    table.appendChild(papers);
    
    parent.appendChild(table);
  },
  
  createBrokenChairs(parent) {
    // Chair 1 - fallen over
    const chair1 = document.createElement('a-entity');
    chair1.setAttribute('position', '2.5 0.2 1');
    chair1.setAttribute('rotation', '0 0 -75');
    
    const seat1 = document.createElement('a-entity');
    seat1.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.05; depth: 0.5');
    seat1.setAttribute('material', 'color: #4a3f35; roughness: 0.8');
    chair1.appendChild(seat1);
    
    const back1 = document.createElement('a-entity');
    back1.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.6; depth: 0.05');
    back1.setAttribute('material', 'color: #4a3f35; roughness: 0.8');
    back1.setAttribute('position', '0 0.3 -0.225');
    chair1.appendChild(back1);
    
    parent.appendChild(chair1);
    
    // Chair 2 - upright but broken
    const chair2 = document.createElement('a-entity');
    chair2.setAttribute('position', '1.8 0.4 2.2');
    
    const seat2 = document.createElement('a-entity');
    seat2.setAttribute('geometry', 'primitive: box; width: 0.5; height: 0.05; depth: 0.5');
    seat2.setAttribute('material', 'color: #3d2f1f; roughness: 0.9');
    chair2.appendChild(seat2);
    
    // Only 3 legs
    const leg2Positions = [[-0.2, -0.2, -0.2], [0.2, -0.2, -0.2], [-0.2, -0.2, 0.2]];
    leg2Positions.forEach(([x, y, z]) => {
      const leg = document.createElement('a-entity');
      leg.setAttribute('geometry', 'primitive: box; width: 0.05; height: 0.4; depth: 0.05');
      leg.setAttribute('material', 'color: #3d2f1f; roughness: 0.9');
      leg.setAttribute('position', `${x} ${y} ${z}`);
      chair2.appendChild(leg);
    });
    
    parent.appendChild(chair2);
  },
  
  createBookshelf(parent) {
    const bookshelf = document.createElement('a-entity');
    bookshelf.setAttribute('position', '5.5 1.0 -1');
    bookshelf.setAttribute('rotation', '0 -90 0');
    
    // Shelf frame
    const frame = document.createElement('a-entity');
    frame.setAttribute('geometry', 'primitive: box; width: 2.0; height: 2.0; depth: 0.3');
    frame.setAttribute('material', 'color: #2d1f0f; roughness: 0.9');
    bookshelf.appendChild(frame);
    
    // Shelves
    for (let i = 0; i < 4; i++) {
      const shelf = document.createElement('a-entity');
      shelf.setAttribute('geometry', 'primitive: box; width: 1.9; height: 0.05; depth: 0.25');
      shelf.setAttribute('material', 'color: #4a3f35; roughness: 0.8');
      shelf.setAttribute('position', `0 ${-0.75 + i * 0.5} 0`);
      bookshelf.appendChild(shelf);
    }
    
    // Books
    const bookCount = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < bookCount; i++) {
      const book = document.createElement('a-entity');
      const height = 0.15 + Math.random() * 0.1;
      const width = 0.05 + Math.random() * 0.03;
      const depth = 0.15;
      
      book.setAttribute('geometry', `primitive: box; width: ${width}; height: ${height}; depth: ${depth}`);
      
      const colors = ['#8b0000', '#006400', '#4b0082', '#8b4513', '#2f4f4f', '#800000'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      book.setAttribute('material', `color: ${color}; roughness: 0.7`);
      
      const shelfLevel = Math.floor(Math.random() * 4);
      const x = (Math.random() - 0.5) * 1.7;
      const y = -0.75 + shelfLevel * 0.5 + height / 2 + 0.025;
      const z = (Math.random() - 0.5) * 0.1;
      
      book.setAttribute('position', `${x} ${y} ${z}`);
      book.setAttribute('rotation', `0 0 ${Math.random() * 10 - 5}`);
      bookshelf.appendChild(book);
    }
    
    parent.appendChild(bookshelf);
  },
  
  createOldTV(parent) {
    const tv = document.createElement('a-entity');
    tv.setAttribute('position', '-4.5 1.2 3');
    tv.setAttribute('rotation', '0 45 0');
    
    // TV body
    const body = document.createElement('a-entity');
    body.setAttribute('geometry', 'primitive: box; width: 0.8; height: 0.6; depth: 0.6');
    body.setAttribute('material', 'color: #2c2c2c; roughness: 0.8; metalness: 0.3');
    tv.appendChild(body);
    
    // Screen (broken)
    const screen = document.createElement('a-entity');
    screen.setAttribute('geometry', 'primitive: box; width: 0.6; height: 0.4; depth: 0.05');
    screen.setAttribute('material', 'color: #1a1a1a; roughness: 0.1');
    screen.setAttribute('position', '0 0 0.275');
    tv.appendChild(screen);
    
    // Crack in screen
    const crack = document.createElement('a-entity');
    crack.setAttribute('geometry', 'primitive: box; width: 0.02; height: 0.35; depth: 0.01');
    crack.setAttribute('material', 'color: #666666');
    crack.setAttribute('position', '0.1 0 0.026');
    crack.setAttribute('rotation', '0 0 15');
    screen.appendChild(crack);
    
    // Antenna
    const antenna1 = document.createElement('a-entity');
    antenna1.setAttribute('geometry', 'primitive: cylinder; radius: 0.005; height: 0.4');
    antenna1.setAttribute('material', 'color: #8b8b8b; metalness: 0.8; roughness: 0.2');
    antenna1.setAttribute('position', '-0.2 0.5 -0.1');
    antenna1.setAttribute('rotation', '-20 0 -30');
    tv.appendChild(antenna1);
    
    const antenna2 = document.createElement('a-entity');
    antenna2.setAttribute('geometry', 'primitive: cylinder; radius: 0.005; height: 0.35');
    antenna2.setAttribute('material', 'color: #8b8b8b; metalness: 0.8; roughness: 0.2');
    antenna2.setAttribute('position', '0.2 0.45 -0.1');
    antenna2.setAttribute('rotation', '25 0 45');
    tv.appendChild(antenna2);
    
    parent.appendChild(tv);
  },
  
  createDebris(parent) {
    // Scattered debris around the house
    const debrisCount = 15 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < debrisCount; i++) {
      const debris = document.createElement('a-entity');
      const type = Math.floor(Math.random() * 4);
      
      switch (type) {
        case 0: // Wood plank
          debris.setAttribute('geometry', `primitive: box; width: ${0.1 + Math.random() * 0.3}; height: 0.02; depth: ${0.3 + Math.random() * 0.5}`);
          debris.setAttribute('material', 'color: #5d4e37; roughness: 0.9');
          break;
        case 1: // Brick
          debris.setAttribute('geometry', `primitive: box; width: 0.08; height: 0.04; depth: 0.16`);
          debris.setAttribute('material', 'color: #8b4513; roughness: 0.8');
          break;
        case 2: // Bottle
          debris.setAttribute('geometry', `primitive: cylinder; radius: 0.03; height: ${0.1 + Math.random() * 0.1}`);
          debris.setAttribute('material', 'color: #228b22; opacity: 0.6; transparent: true');
          break;
        case 3: // Paper
          debris.setAttribute('geometry', `primitive: box; width: ${0.15 + Math.random() * 0.1}; height: 0.001; depth: ${0.1 + Math.random() * 0.1}`);
          debris.setAttribute('material', 'color: #f5f5dc; roughness: 0.9');
          break;
      }
      
      const x = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      debris.setAttribute('position', `${x} 0.02 ${z}`);
      debris.setAttribute('rotation', `0 ${Math.random() * 360} 0`);
      
      parent.appendChild(debris);
    }
  },
  
  createBarrels(parent) {
    // Oil barrels for cover
    const barrelPositions = [
      { pos: '4.5 0.4 -4.5', color: '#4b0000' },
      { pos: '-4.8 0.4 4.2', color: '#2f4f4f' },
      { pos: '2.8 0.4 4.8', color: '#8b4513' }
    ];
    
    barrelPositions.forEach(barrel => {
      const barrelEl = document.createElement('a-entity');
      barrelEl.setAttribute('geometry', 'primitive: cylinder; radius: 0.3; height: 0.8');
      barrelEl.setAttribute('material', `color: ${barrel.color}; roughness: 0.8; metalness: 0.2`);
      barrelEl.setAttribute('position', barrel.pos);
      barrelEl.setAttribute('shadow', 'cast: true; receive: true');
      
      // Barrel bands
      for (let i = 0; i < 3; i++) {
        const band = document.createElement('a-entity');
        band.setAttribute('geometry', 'primitive: torus; radius: 0.31; radiusTubular: 0.02');
        band.setAttribute('material', 'color: #2c2c2c; metalness: 0.8; roughness: 0.3');
        band.setAttribute('position', `0 ${-0.3 + i * 0.3} 0`);
        band.setAttribute('rotation', '90 0 0');
        barrelEl.appendChild(band);
      }
      
      // Dents and rust
      const dent = document.createElement('a-entity');
      dent.setAttribute('geometry', 'primitive: sphere; radius: 0.05');
      dent.setAttribute('material', 'color: #8b4513; roughness: 1');
      dent.setAttribute('position', `${0.2 + Math.random() * 0.1} ${Math.random() * 0.3} 0`);
      barrelEl.appendChild(dent);
      
      parent.appendChild(barrelEl);
    });
  },
  
  createCobwebs(parent) {
    // Cobwebs in corners
    const cobwebPositions = [
      { pos: '5.8 2.8 -5.8', rot: '0 45 0' },
      { pos: '-5.8 2.8 5.8', rot: '0 -45 0' },
      { pos: '5.8 2.8 5.8', rot: '0 135 0' },
      { pos: '-5.8 2.8 -5.8', rot: '0 -135 0' }
    ];
    
    cobwebPositions.forEach(web => {
      const cobweb = document.createElement('a-entity');
      cobweb.setAttribute('geometry', 'primitive: plane; width: 0.5; height: 0.5');
      cobweb.setAttribute('material', 'color: #f5f5f5; opacity: 0.3; transparent: true; side: double');
      cobweb.setAttribute('position', web.pos);
      cobweb.setAttribute('rotation', web.rot);
      
      parent.appendChild(cobweb);
    });
  },
  
  createDust(parent) {
    // Floating dust particles
    const dustContainer = document.createElement('a-entity');
    dustContainer.setAttribute('id', 'dustParticles');
    
    for (let i = 0; i < 50; i++) {
      const dust = document.createElement('a-entity');
      dust.setAttribute('geometry', 'primitive: sphere; radius: 0.002');
      dust.setAttribute('material', 'color: #d3d3d3; opacity: 0.4; transparent: true');
      
      const x = (Math.random() - 0.5) * 12;
      const y = 0.5 + Math.random() * 2;
      const z = (Math.random() - 0.5) * 12;
      
      dust.setAttribute('position', `${x} ${y} ${z}`);
      
      // Slow floating animation
      const newY = y + (Math.random() - 0.5) * 0.5;
      const newX = x + (Math.random() - 0.5) * 0.3;
      const newZ = z + (Math.random() - 0.5) * 0.3;
      
      dust.setAttribute('animation', `property: position; to: ${newX} ${newY} ${newZ}; dur: ${8000 + Math.random() * 4000}; loop: true; direction: alternate; easing: linear`);
      
      dustContainer.appendChild(dust);
    }
    
    parent.appendChild(dustContainer);
  },
  
  createExteriorEnvironment(parent) {
    // This would create outdoor environment elements
    // Trees, other buildings, etc. (abbreviated for space)
    this.createTrees(parent);
    this.createStreetElements(parent);
  },
  
  createTrees(parent) {
    const treePositions = [
      { pos: '-8 2 -8', scale: '1 1 1' },
      { pos: '9 2.5 -6', scale: '1.2 1.2 1.2' },
      { pos: '-7 1.8 8', scale: '0.8 0.8 0.8' },
      { pos: '8 2.2 9', scale: '1.1 1.1 1.1' }
    ];
    
    treePositions.forEach(treeData => {
      const tree = document.createElement('a-entity');
      
      // Trunk
      const trunk = document.createElement('a-entity');
      trunk.setAttribute('geometry', 'primitive: cylinder; radius: 0.2; height: 3');
      trunk.setAttribute('material', 'color: #4a3f35; roughness: 0.9');
      trunk.setAttribute('position', '0 1.5 0');
      tree.appendChild(trunk);
      
      // Leaves
      const leaves = document.createElement('a-entity');
      leaves.setAttribute('geometry', 'primitive: sphere; radius: 1.5');
      leaves.setAttribute('material', 'color: #2d4a2d; roughness: 0.8');
      leaves.setAttribute('position', '0 3.5 0');
      tree.appendChild(leaves);
      
      tree.setAttribute('position', treeData.pos);
      tree.setAttribute('scale', treeData.scale);
      tree.setAttribute('shadow', 'cast: true; receive: true');
      
      parent.appendChild(tree);
    });
  },
  
  createStreetElements(parent) {
    // Abandoned car
    const car = document.createElement('a-entity');
    car.setAttribute('position', '10 0.3 5');
    car.setAttribute('rotation', '0 -30 0');
    
    const carBody = document.createElement('a-entity');
    carBody.setAttribute('geometry', 'primitive: box; width: 1.8; height: 0.6; depth: 4');
    carBody.setAttribute('material', 'color: #8b0000; roughness: 0.8; metalness: 0.2');
    car.appendChild(carBody);
    
    // Wheels
    const wheelPositions = [[-0.7, -0.3, -1.5], [0.7, -0.3, -1.5], [-0.7, -0.3, 1.5], [0.7, -0.3, 1.5]];
    wheelPositions.forEach(([x, y, z]) => {
      const wheel = document.createElement('a-entity');
      wheel.setAttribute('geometry', 'primitive: cylinder; radius: 0.25; height: 0.15');
      wheel.setAttribute('material', 'color: #2c2c2c; roughness: 0.9');
      wheel.setAttribute('position', `${x} ${y} ${z}`);
      wheel.setAttribute('rotation', '0 0 90');
      car.appendChild(wheel);
    });
    
    parent.appendChild(car);
  },
  
  createAtmosphericEffects() {
    // Particle effects, ambient sounds setup, etc.
    this.createFireBarrelEffect();
  },
  
  createFireBarrelEffect() {
    const fireBarrel = document.createElement('a-entity');
    fireBarrel.setAttribute('position', '-8 1 4');
    
    // Barrel
    const barrel = document.createElement('a-entity');
    barrel.setAttribute('geometry', 'primitive: cylinder; radius: 0.3; height: 0.8');
    barrel.setAttribute('material', 'color: #4b0000; roughness: 0.8');
    fireBarrel.appendChild(barrel);
    
    // Fire effect (simplified)
    const fire = document.createElement('a-entity');
    fire.setAttribute('geometry', 'primitive: cone; radius: 0.2; height: 0.5');
    fire.setAttribute('material', 'color: #ff4500; emissive: #ff4500; emissiveIntensity: 0.8; opacity: 0.7; transparent: true');
    fire.setAttribute('position', '0 0.8 0');
    fire.setAttribute('animation', 'property: scale; to: 1.2 1.4 1.2; dur: 1000; direction: alternate; loop: true; easing: easeInOutQuad');
    fireBarrel.appendChild(fire);
    
    // Smoke particles
    for (let i = 0; i < 10; i++) {
      const smoke = document.createElement('a-entity');
      smoke.setAttribute('geometry', 'primitive: sphere; radius: 0.1');
      smoke.setAttribute('material', 'color: #696969; opacity: 0.3; transparent: true');
      smoke.setAttribute('position', `${(Math.random() - 0.5) * 0.4} ${1.2 + i * 0.2} ${(Math.random() - 0.5) * 0.4}`);
      smoke.setAttribute('animation', `property: position; to: ${(Math.random() - 0.5) * 2} ${3 + Math.random() * 2} ${(Math.random() - 0.5) * 2}; dur: ${3000 + Math.random() * 2000}; loop: true; easing: linear`);
      smoke.setAttribute('animation__fade', 'property: material.opacity; to: 0; dur: 3000; loop: true; easing: linear');
      smoke.setAttribute('animation__grow', 'property: scale; to: 2 2 2; dur: 3000; loop: true; easing: linear');
      fireBarrel.appendChild(smoke);
    }
    
    document.querySelector('a-scene').appendChild(fireBarrel);
  }
});

// Component to initialize detailed environment
AFRAME.registerComponent('environment-manager', {
  init() {
    // Initialize the detailed environment
    this.el.setAttribute('detailed-environment', '');
  }
});
