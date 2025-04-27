export function adjustObstacleHitboxes(worldGenerator: any) {
  // Get all areas in the world generator
  const areas = worldGenerator.getObstacles();
  
  // For each area that has been generated
  for (const areaKey in areas) {
    const obstacles = areas[areaKey];
    if (!obstacles || !Array.isArray(obstacles)) continue;
    
    // Adjust hitboxes for each obstacle
    for (const obstacle of obstacles) {
      switch (obstacle.type) {
        case 'cactus':
          // Make cactus hitbox slightly smaller than visual
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.8 : 15; // 80% of visual or default 15
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.8 : 20; // 80% of visual or default 20
          }
          break;
          
        case 'rock':
        case 'smallRock':
          // Make rock hitboxes match visual size more closely
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = obstacle.size ? obstacle.size * 17 * 0.85 : 14; // 85% of visual
            obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.85 : 12; // 85% of visual
          }
          break;
          
        case 'metalNode':
        case 'copperNode':
          // Make resource nodes have tighter hitboxes
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = obstacle.size ? obstacle.size * 16 * 0.9 : 14; // 90% of visual
            obstacle.hitboxHeight = obstacle.size ? obstacle.size * 14 * 0.9 : 12; // 90% of visual
          }
          break;
          
        case 'fuelPump':
          // Adjust fuel pump hitbox slightly
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = 20 * 0.9; // 90% of visual
            obstacle.hitboxHeight = 30 * 0.9; // 90% of visual
          }
          break;
          
        case 'windmill':
          // Make windmill hitbox more realistic (exclude spinning blades from collision)
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = 16; // Just the center pole
            obstacle.hitboxHeight = 60; // Tall but narrow
          }
          break;
          
        case 'house':
        case 'hut':
          // Make building hitboxes slightly smaller than visual
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.95 : 45; // 95% of visual
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.95 : 35; // 95% of visual
          }
          break;
          
        case 'tarp':
          // Make tarp hitbox smaller to allow walking under its edges
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = obstacle.width ? obstacle.width * 0.7 : 42; // 70% of visual
            obstacle.hitboxHeight = obstacle.height ? obstacle.height * 0.7 : 35; // 70% of visual
          }
          break;
          
        case 'fuelCanister':
          // Make fuel canisters slightly smaller hitbox for easier navigation
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = 15; // Smaller than visual
            obstacle.hitboxHeight = 20; // Smaller than visual
          }
          break;
          
        case 'carWreck':
        case 'shipWreck':
        case 'planeWreck':
          // Set hitboxes for wrecks
          if (obstacle.hitboxWidth === undefined) {
            obstacle.hitboxWidth = 50;
            obstacle.hitboxHeight = 40;
          }
          break;
      }
    }
  }
  
  // Also apply to the resources
  const resources = worldGenerator.getResources();
  for (const areaKey in resources) {
    const areaResources = resources[areaKey];
    if (!areaResources || !Array.isArray(areaResources)) continue;
    
    for (const resource of areaResources) {
      if (resource.type === 'fuelCanister') {
        resource.hitboxWidth = 15; // Smaller hitbox
        resource.hitboxHeight = 20; // Smaller hitbox
      }
    }
  }
}

export function placeMilitaryCrate(p: any, worldGenerator: any) {
  const possibleLocations = [
    { worldX: -1, worldY: -1 },
    { worldX: 0, worldY: -1 },
    { worldX: 1, worldY: -1 },
    { worldX: -1, worldY: 0 },
    { worldX: 1, worldY: 0 },
    { worldX: -1, worldY: 1 },
    { worldX: 0, worldY: 1 },
    { worldX: 1, worldY: 1 }
  ];
  
  const randomIndex = Math.floor(p.random(possibleLocations.length));
  const location = possibleLocations[randomIndex];
  
  const militaryCrateLocation = {
    worldX: location.worldX,
    worldY: location.worldY
  };
  
  const areaKey = `${location.worldX},${location.worldY}`;
  if (!worldGenerator.getObstacles()[areaKey]) {
    worldGenerator.generateNewArea(location.worldX, location.worldY);
  }
  
  let obstacles = worldGenerator.getObstacles()[areaKey] || [];
  
  obstacles.push({
    type: 'militaryCrate',
    x: p.width / 2,
    y: p.height / 2,
    opened: false,
    size: 1.0
  });
  
  worldGenerator.getObstacles()[areaKey] = obstacles;
  
  console.log(`Placed military crate at world coordinates: ${location.worldX}, ${location.worldY}`);
  
  return militaryCrateLocation;
}

export function checkHoverbikeCanisterCollisions(p: any, hoverbike: any, worldX: number, worldY: number, riding: boolean, worldGenerator: any, renderer: any): void {
  if (!riding || hoverbike.worldX !== worldX || hoverbike.worldY !== worldY) {
    return;
  }
  
  const currentAreaKey = `${worldX},${worldY}`;
  const resources = worldGenerator.getResources()[currentAreaKey] || [];
  
  for (let i = resources.length - 1; i >= 0; i--) {
    const resource = resources[i];
    if (resource.type === 'fuelCanister') {
      const dx = hoverbike.x - resource.x;
      const dy = hoverbike.y - resource.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 25) {  // Collision radius for canister
        // Create explosion
        createExplosion(p, resource.x, resource.y, worldX, worldY, worldGenerator, renderer);
        
        // Damage hoverbike critically
        hoverbike.health = Math.max(0, hoverbike.health - 50);
        
        // Apply force to hoverbike from explosion
        const pushAngle = Math.atan2(dy, dx);
        hoverbike.velocityX += Math.cos(pushAngle) * 2;
        hoverbike.velocityY += Math.sin(pushAngle) * 2;
        
        // Remove the canister
        resources.splice(i, 1);
        break;
      }
    }
  }
}

export function createExplosion(p: any, x: number, y: number, worldX: number, worldY: number, worldGenerator: any, renderer: any): void {
  // Add explosion effect to the current area's obstacles temporarily
  const currentAreaKey = `${worldX},${worldY}`;
  let obstacles = [];
  
  // Handle both cases where worldGenerator might be the actual generator or the obstacles object
  if (typeof worldGenerator.getObstacles === 'function') {
    obstacles = worldGenerator.getObstacles()[currentAreaKey] || [];
  } else {
    obstacles = worldGenerator[currentAreaKey] || [];
  }
  
  // Create multiple explosion particles for a more dramatic effect
  for (let i = 0; i < 20; i++) {  // Increased from 10 to 20 particles
    const offsetX = p.random(-30, 30);  // Increased spread
    const offsetY = p.random(-30, 30);  // Increased spread
    const size = p.random(0.7, 1.8);    // Larger max size
    const delay = p.floor(p.random(0, 15)); // More varied delay
    
    obstacles.push({
      type: 'explosion',
      x: x + offsetX,
      y: y + offsetY,
      size: size,
      frame: delay,
      maxFrames: 30 + delay
    });
  }
  
  // Create more smoke particles that linger longer
  for (let i = 0; i < 25; i++) {  // Increased from 15 to 25
    const offsetX = p.random(-40, 40);  // Wider spread
    const offsetY = p.random(-40, 40);  // Wider spread
    const size = p.random(0.5, 1.5);    // Larger max size
    const delay = p.floor(p.random(5, 25));
    const duration = p.random(90, 150); // More varied durations
    
    obstacles.push({
      type: 'smoke',
      x: x + offsetX,
      y: y + offsetY,
      size: size,
      frame: delay,
      maxFrames: duration + delay,
      alpha: 255
    });
  }
  
  // Add debris particles
  for (let i = 0; i < 15; i++) {
    const angle = p.random(0, Math.PI * 2);
    const speed = p.random(0.5, 3);
    const size = p.random(1, 4);
    
    obstacles.push({
      type: 'debris',
      x: x,
      y: y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: size,
      rotation: p.random(0, Math.PI * 2),
      rotationSpeed: p.random(-0.1, 0.1),
      lifetime: 120 + p.random(0, 60),
      age: 0,
      color: {
        r: p.random(50, 100),
        g: p.random(30, 60),
        b: p.random(10, 30)
      }
    });
  }
  
  // Add a flash effect
  obstacles.push({
    type: 'flash',
    x: x,
    y: y,
    size: 1.0,
    frame: 0,
    maxFrames: 10
  });
  
  // Update obstacles
  if (typeof worldGenerator.getObstacles === 'function') {
    worldGenerator.getObstacles()[currentAreaKey] = obstacles;
  } else {
    worldGenerator[currentAreaKey] = obstacles;
  }
  
  // Make screen shake effect more intense
  renderer.startScreenShake(1.2, 25);
  
  // Remove explosion particles after they fade
  setTimeout(() => {
    const currentObstacles = typeof worldGenerator.getObstacles === 'function' 
      ? worldGenerator.getObstacles()[currentAreaKey] || []
      : worldGenerator[currentAreaKey] || [];
      
    const updatedObstacles = currentObstacles.filter(o => 
      o.type !== 'explosion' && o.type !== 'smoke' && o.type !== 'flash' && o.type !== 'debris'
    );
    
    if (typeof worldGenerator.getObstacles === 'function') {
      worldGenerator.getObstacles()[currentAreaKey] = updatedObstacles;
    } else {
      worldGenerator[currentAreaKey] = updatedObstacles;
    }
  }, 3000);  // Increased from 2000 to 3000 ms for longer effect
}

export function interactWithWreck(
  p: any, 
  player: any, 
  worldX: number, 
  worldY: number, 
  wreck: any, 
  questSystem: any
): { 
  metalCollected: number, 
  copperCollected: number, 
  fuelCanisterAvailable: boolean 
} {
  if (wreck.looted) {
    return { 
      metalCollected: 0, 
      copperCollected: 0, 
      fuelCanisterAvailable: !wreck.canisterCollected
    };
  }
  
  // Mark wreck as looted
  wreck.looted = true;
  
  // Random amount of resources (between 1-8 of each)
  const metalCollected = Math.floor(p.random(1, 9)); // 1 to 8
  const copperCollected = Math.floor(p.random(1, 9)); // 1 to 8
  
  // Add a diary entry based on the wreck type
  let diaryEntry = "";
  switch (wreck.type) {
    case 'carWreck':
      diaryEntry = "I found the rusted chassis of an old car today, half-buried in the sand. It must have been here for decades. Stripped most of it for parts. The surprising thing was finding an intact fuel canister inside what remained of the trunk. These old vehicles weren't very efficient, but their fuel containers were built to last.";
      break;
    case 'shipWreck':
      diaryEntry = "There's an old ship hull in the middle of the desert. Strange to think this place might have been underwater once. The metal was still in decent shape, protected from the worst of the elements by the sand. Found what looks like an old fuel container from the engine room. Might be useful for the bike.";
      break;
    case 'planeWreck':
      diaryEntry = "I stumbled across the remains of a small aircraft today. Most of it was buried, just the tail and part of a wing sticking out. The instruments were long gone, but I salvaged some useful materials. In what remained of a storage compartment, I found an old aviation fuel canister. Lucky find.";
      break;
  }
  
  // Add the diary entry
  if (questSystem && diaryEntry) {
    for (let i = 0; i < questSystem.diaryEntries.length; i++) {
      if (!questSystem.diaryEntries[i]) {
        questSystem.diaryEntries[i] = diaryEntry;
        break;
      }
    }
  }
  
  return {
    metalCollected,
    copperCollected,
    fuelCanisterAvailable: true
  };
}

export function collectWreckFuelCanister(wreck: any): boolean {
  if (wreck.canisterCollected || !wreck.looted) {
    return false;
  }
  
  wreck.canisterCollected = true;
  return true;
}
