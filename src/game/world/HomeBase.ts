
export function addTarpAtHomeBase(p: any, worldGenerator: any, tarpColor: any): void {
  const homeAreaKey = "0,0";
  let homeObstacles = worldGenerator.getObstacles()[homeAreaKey] || [];
  
  const hasTarp = homeObstacles.some(obs => obs.type === 'tarp');
  
  if (!hasTarp) {
    homeObstacles.push({
      type: 'tarp',
      x: p.width / 2 - 120, // To the left of the hut
      y: p.height / 2 - 50, // Align with the hut
      width: 60, // Smaller tarp
      height: 50, // Smaller tarp
      color: tarpColor,
      zIndex: 90000 // Extremely high z-index to ensure it renders above everything else
    });
    
    worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    
    clearObstaclesNearTarp(worldGenerator, homeAreaKey);
  }
}

export function clearObstaclesNearTarp(worldGenerator: any, areaKey: string): void {
  const obstacles = worldGenerator.getObstacles()[areaKey] || [];
  const tarp = obstacles.find(obs => obs.type === 'tarp');
  
  if (!tarp) return;
  
  // Define clearance area around tarp (slightly larger than tarp itself)
  const clearMargin = 20;
  const minX = tarp.x - (tarp.width / 2) - clearMargin;
  const maxX = tarp.x + (tarp.width / 2) + clearMargin;
  const minY = tarp.y - (tarp.height / 2) - clearMargin;
  const maxY = tarp.y + (tarp.height / 2) + clearMargin;
  
  // Filter out any obstacles in the clearance area except the tarp itself
  const filteredObstacles = obstacles.filter(obs => {
    if (obs.type === 'tarp') return true;
    
    // Skip obstacles that don't have x/y coordinates
    if (obs.x === undefined || obs.y === undefined) return true;
    
    // Check if obstacle is in the clearance area
    const inClearanceArea = (
      obs.x >= minX && obs.x <= maxX &&
      obs.y >= minY && obs.y <= maxY
    );
    
    // Keep it if it's not in the clearance area
    return !inClearanceArea;
  });
  
  // Update the obstacles for this area
  worldGenerator.getObstacles()[areaKey] = filteredObstacles;
}

export function addFuelStationAtHomeBase(p: any, worldGenerator: any): void {
  const homeAreaKey = "0,0";
  let homeObstacles = worldGenerator.getObstacles()[homeAreaKey] || [];
  
  // Add fuel pump if it doesn't exist
  const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
  
  if (!hasFuelPump) {
    // Add fuel stains first (so they render underneath)
    // Create multiple fixed stains with different seed angles
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 100,
      y: p.height / 2 - 45, // Slightly offset from the pump
      seedAngle: 0.5,
      size: 1.2
    });
    
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 110,
      y: p.height / 2 - 40,
      seedAngle: 2.1,
      size: 0.9
    });
    
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 95,
      y: p.height / 2 - 55,
      seedAngle: 4.2,
      size: 1.0
    });
    
    // Add more fuel stains in a wider area to represent the extended refueling zone
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 130,
      y: p.height / 2 - 50,
      seedAngle: 3.3,
      size: 0.8
    });
    
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 85,
      y: p.height / 2 - 70,
      seedAngle: 1.7,
      size: 0.7
    });
    
    // Add even more stains to indicate the larger refueling area
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 150,
      y: p.height / 2 - 60,
      seedAngle: 5.2,
      size: 0.6
    });
    
    homeObstacles.push({
      type: 'fuelStain',
      x: p.width / 2 + 70,
      y: p.height / 2 - 90,
      seedAngle: 2.5,
      size: 0.75
    });
    
    // Add fuel pump without stains now (stains are separate objects)
    homeObstacles.push({
      type: 'fuelPump',
      x: p.width / 2 + 100,
      y: p.height / 2 - 50,
      size: 1.0,
    });
    
    // Update the world generator's obstacles
    worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
  }
}

export function addWalkingMarksAtHomeBase(p: any, worldGenerator: any): void {
  const homeAreaKey = "0,0";
  let homeObstacles = worldGenerator.getObstacles()[homeAreaKey] || [];
  
  // Add walking marks
  const hasWalkingMarks = homeObstacles.some(obs => obs.type === 'walkingMarks');
  
  if (!hasWalkingMarks) {
    // Add multiple footprint sets in a pattern approaching the home base
    // Use fixed positions for stability
    const walkingMarkPositions = [
      { x: p.width / 2 - 80, y: p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170 },
      { x: p.width / 2 + 45, y: p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150 },
      { x: p.width / 2 - 30, y: p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190 },
      { x: p.width / 2 + 80, y: p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160 },
      { x: p.width / 2 - 60, y: p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180 }
    ];
    
    for (const position of walkingMarkPositions) {
      homeObstacles.push({
        type: 'walkingMarks',
        ...position
      });
    }
    
    // Update the world generator's obstacles
    worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
  }
}

export function addGrandpaAtHomeBase(p: any, worldGenerator: any): void {
  const homeAreaKey = "0,0";
  let homeObstacles = worldGenerator.getObstacles()[homeAreaKey] || [];
  
  // Add grandpa NPC if not already present
  const hasGrandpa = homeObstacles.some(obs => obs.type === 'grandpa');
  
  if (!hasGrandpa) {
    // Position grandpa directly in front of the hut (adjust coordinates)
    homeObstacles.push({
      type: 'grandpa',
      x: p.width / 2 - 15, // Slightly offset to the left of the hut entrance
      y: p.height / 2 + 15, // Slightly in front of the hut
      size: 1.0
    });
    
    worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
  }
}

export function isPlayerUnderTarp(p: any, player: any, worldX: number, worldY: number, worldGenerator: any): boolean {
  if (worldX !== 0 || worldY !== 0) {
    return false; // Only at home base
  }
  
  const homeObstacles = worldGenerator.getObstacles()["0,0"] || [];
  const tarp = homeObstacles.find(obs => obs.type === 'tarp');
  
  if (!tarp) {
    return false;
  }
  
  // Check if player is under the tarp
  return (
    player.x >= tarp.x - tarp.width / 2 &&
    player.x <= tarp.x + tarp.width / 2 &&
    player.y >= tarp.y - tarp.height / 2 &&
    player.y <= tarp.y + tarp.height / 2
  );
}
