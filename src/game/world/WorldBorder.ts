
export function checkBorder(
  p: any, 
  player: any, 
  hoverbike: any, 
  worldX: number, 
  worldY: number, 
  riding: boolean,
  renderer: any, 
  worldGenerator: any, 
  exploredAreas: Set<string>
): {
  worldX: number;
  worldY: number;
} {
  let newWorldX = worldX;
  let newWorldY = worldY;
  
  if (player.x > p.width) {
    newWorldX++;
    player.x = 0;
    player.setWorldCoordinates(newWorldX, newWorldY);
    
    if (riding) {
      hoverbike.x = player.x;
      hoverbike.setWorldCoordinates(newWorldX, newWorldY);
    }
    
    renderer.setWorldCoordinates(newWorldX, newWorldY);
    worldGenerator.generateNewArea(newWorldX, newWorldY);
    exploredAreas.add(`${newWorldX},${newWorldY}`); // Mark as explored
    
    // Apply adjusted hitboxes to the new area
    adjustObstacleHitboxes(worldGenerator);
  } 
  else if (player.x < 0) {
    newWorldX--;
    player.x = p.width;
    player.setWorldCoordinates(newWorldX, newWorldY);
    
    if (riding) {
      hoverbike.x = player.x;
      hoverbike.setWorldCoordinates(newWorldX, newWorldY);
    }
    
    renderer.setWorldCoordinates(newWorldX, newWorldY);
    worldGenerator.generateNewArea(newWorldX, newWorldY);
    exploredAreas.add(`${newWorldX},${newWorldY}`); // Mark as explored
    
    // Apply adjusted hitboxes to the new area
    adjustObstacleHitboxes(worldGenerator);
  }
  
  if (player.y > p.height) {
    newWorldY++;
    player.y = 0;
    player.setWorldCoordinates(newWorldX, newWorldY);
    
    if (riding) {
      hoverbike.y = player.y;
      hoverbike.setWorldCoordinates(newWorldX, newWorldY);
    }
    
    renderer.setWorldCoordinates(newWorldX, newWorldY);
    worldGenerator.generateNewArea(newWorldX, newWorldY);
    exploredAreas.add(`${newWorldX},${newWorldY}`); // Mark as explored
    
    // Apply adjusted hitboxes to the new area
    adjustObstacleHitboxes(worldGenerator);
  } 
  else if (player.y < 0) {
    newWorldY--;
    player.y = p.height;
    player.setWorldCoordinates(newWorldX, newWorldY);
    
    if (riding) {
      hoverbike.y = player.y;
      hoverbike.setWorldCoordinates(newWorldX, newWorldY);
    }
    
    renderer.setWorldCoordinates(newWorldX, newWorldY);
    worldGenerator.generateNewArea(newWorldX, newWorldY);
    exploredAreas.add(`${newWorldX},${newWorldY}`); // Mark as explored
    
    // Apply adjusted hitboxes to the new area
    adjustObstacleHitboxes(worldGenerator);
  }

  return { worldX: newWorldX, worldY: newWorldY };
}

// Helper function for adjusting hitboxes - import this from WorldInteraction.ts
import { adjustObstacleHitboxes } from './WorldInteraction';
