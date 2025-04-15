
import { emitGameStateUpdate } from '../../utils/gameUtils';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { MilitaryCrateQuest } from './QuestSystem';

export function initializeMilitaryCrateQuest(): MilitaryCrateQuest {
  return {
    active: false,
    completed: false,
    crateOpened: false,
    targetX: 0,
    targetY: 0,
    showCompletionMessage: false,
    completionMessageTimer: 0,
    rewardGiven: false
  };
}

export function placeMilitaryCrate(p: any, worldGenerator: any): { worldX: number, worldY: number } {
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

export function updateMilitaryCrateQuest(
  questSystem: any,
  player: Player,
  hoverbike: Hoverbike,
  worldX: number,
  worldY: number,
  militaryCrateLocation: { worldX: number, worldY: number }
): void {
  const quest = questSystem.militaryCrateQuest;
  
  // Check if player is at the military crate location
  if (worldX === militaryCrateLocation.worldX && worldY === militaryCrateLocation.worldY) {
    // Future implementation for crate interaction
    
    // Update UI if needed
    if (quest.showCompletionMessage) {
      quest.completionMessageTimer++;
      
      if (quest.completionMessageTimer > 600) {
        quest.showCompletionMessage = false;
        quest.completionMessageTimer = 0;
      }
    }
  }
}
