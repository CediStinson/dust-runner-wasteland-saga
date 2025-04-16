
import { WorldData } from '../../types/GameTypes';

export function getWorldData(exploredAreas: Set<string>, worldGenerator: any): WorldData {
  const exploredAreasArray = Array.from(exploredAreas);
  const obstacles = {};
  const resources = {};
  
  // Only save data for explored areas
  for (const areaKey of exploredAreasArray) {
    if (worldGenerator.getObstacles()[areaKey]) {
      obstacles[areaKey] = worldGenerator.getObstacles()[areaKey];
    }
    if (worldGenerator.getResources()[areaKey]) {
      resources[areaKey] = worldGenerator.getResources()[areaKey];
    }
  }
  
  return {
    exploredAreas: exploredAreasArray,
    obstacles,
    resources
  };
}

export function loadWorldData(
  worldData: WorldData | null | undefined, 
  worldGenerator: any, 
  exploredAreas: Set<string>, 
  worldX: number, 
  worldY: number
): void {
  if (!worldData) return;
  
  // Restore explored areas
  exploredAreas.clear();
  (worldData.exploredAreas || []).forEach(area => exploredAreas.add(area));
  
  // Restore obstacles and resources
  if (worldData.obstacles) {
    for (const areaKey in worldData.obstacles) {
      worldGenerator.getObstacles()[areaKey] = worldData.obstacles[areaKey];
    }
  }
  
  if (worldData.resources) {
    for (const areaKey in worldData.resources) {
      worldGenerator.getResources()[areaKey] = worldData.resources[areaKey];
    }
  }
  
  // Ensure the current area is properly loaded
  const currentAreaKey = `${worldX},${worldY}`;
  if (!worldGenerator.getObstacles()[currentAreaKey]) {
    worldGenerator.generateNewArea(worldX, worldY);
    exploredAreas.add(currentAreaKey);
  }
}

export function resetGameState(game: any): void {
  // Clean up any active events or intervals
  if (game.player) {
    game.player.isCollectingCanister = false;
    game.player.isRefuelingHoverbike = false;
    game.player.isRepairingHoverbike = false;
  }
  game.sleepingInHut = false;
  game.gameStarted = false;
}

export function createDefaultGameState(newGame: any): any {
  return {
    resources: 0,
    copper: 0,
    health: newGame.hoverbike?.maxHealth || 100,
    maxHealth: newGame.hoverbike?.maxHealth || 100,
    fuel: newGame.hoverbike?.maxFuel || 100,
    maxFuel: newGame.hoverbike?.maxFuel || 100,
    playerHealth: newGame.player?.maxHealth || 100,
    maxPlayerHealth: newGame.player?.maxHealth || 100,
    worldX: 0,
    worldY: 0,
    playerX: newGame.player?.x || 0, 
    playerY: newGame.player?.y || 0,
    playerAngle: 0,
    carryingFuelCanister: false,
    hoverbikeX: newGame.hoverbike?.x || 0,
    hoverbikeY: newGame.hoverbike?.y || 0,
    hoverbikeAngle: 0,
    hoverbikeWorldX: 0,
    hoverbikeWorldY: 0,
    baseWorldX: 0,
    baseWorldY: 0,
    dayTimeIcon: "sun",
    dayTimeAngle: 0,
    worldData: null,
    gameStarted: false,
    sleepingInHut: false,
    diaryEntries: ["", "", "", "", ""]
  };
}
