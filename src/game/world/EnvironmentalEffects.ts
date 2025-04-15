
export function generateTarpColor(): { r: number; g: number; b: number; } {
  // Generate random color in brown/red/green dark tones
  const colorType = Math.floor(Math.random() * 3); // 0: brown, 1: dark red, 2: dark green
  
  let r, g, b;
  
  switch (colorType) {
    case 0: // Brown tones
      r = Math.floor(Math.random() * 80) + 80; // 80-160
      g = Math.floor(Math.random() * 60) + 40; // 40-100
      b = Math.floor(Math.random() * 30) + 20; // 20-50
      break;
    case 1: // Dark red tones
      r = Math.floor(Math.random() * 70) + 120; // 120-190
      g = Math.floor(Math.random() * 30) + 30; // 30-60
      b = Math.floor(Math.random() * 30) + 30; // 30-60
      break;
    case 2: // Dark green tones
      r = Math.floor(Math.random() * 40) + 30; // 30-70
      g = Math.floor(Math.random() * 50) + 70; // 70-120
      b = Math.floor(Math.random() * 30) + 20; // 20-50
      break;
    default:
      r = 100;
      g = 70;
      b = 40;
  }
  
  return { r, g, b };
}

export function initializeEnvironment(
  p: any, 
  worldGenerator: any,
  tarpColor: { r: number, g: number, b: number }
): void {
  // Generate the initial area
  worldGenerator.generateNewArea(0, 0);
  
  // Add the fuel station at home base
  addFuelStationAtHomeBase(p, worldGenerator);
  
  // Add the tarp at home base
  addTarpAtHomeBase(p, worldGenerator, tarpColor);
  
  // Add walking marks
  addWalkingMarksAtHomeBase(p, worldGenerator);
  
  // Modify the world generator to make copper rarer
  worldGenerator.COPPER_CHANCE = 0.05; // Make copper 5 times rarer (was ~0.25)
  
  // Fix obstacle hitboxes for common objects
  adjustObstacleHitboxes(worldGenerator);
}

// Import these from HomeBase.ts and WorldInteraction.ts
import { 
  addTarpAtHomeBase, 
  addFuelStationAtHomeBase, 
  addWalkingMarksAtHomeBase 
} from './HomeBase';
import { adjustObstacleHitboxes } from './WorldInteraction';
