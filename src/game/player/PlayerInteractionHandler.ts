
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { showTarpMessage } from '../world/HomeBaseHelper';

export function handleKeyPress(
  key: string, 
  player: Player, 
  hoverbike: Hoverbike, 
  riding: boolean, 
  worldX: number, 
  worldY: number,
  p: any,
  worldGenerator: any,
  isPlayerUnderTarp: () => boolean
): { riding: boolean } {
  let updatedRiding = riding;
  
  if (key === 'f' || key === 'F') {
    if (riding) {
      updatedRiding = false;
      player.setRiding(false);
    } else if (p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
              hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
      updatedRiding = true;
      player.setRiding(true);
    }
  }
  
  if (key === 'r' && !riding && 
      p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
      hoverbike.worldX === worldX && hoverbike.worldY === worldY &&
      player.inventory.metal > 0) { // Only if player has metal
    
    // Check if under tarp
    if (isPlayerUnderTarp()) {
      // Start the repair process
      player.startHoverbikeRepair();
    } else {
      // Show message that repair needs to be under tarp
      showTarpMessage(p, hoverbike, worldX, worldY, worldGenerator);
    }
  }
  
  return { riding: updatedRiding };
}

export function handleMouseClick(
  mouseX: number, 
  mouseY: number, 
  gameStarted: boolean, 
  p: any
): { gameStarted: boolean } {
  let updatedGameStarted = gameStarted;
  
  // Handle clicks in main menu
  if (!gameStarted) {
    // Check if start button is clicked
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = p.width/2 - btnWidth/2;
    const btnY = p.height/2 + 30;
    
    if (mouseX > btnX && mouseX < btnX + btnWidth && 
        mouseY > btnY && mouseY < btnY + btnHeight) {
      updatedGameStarted = true;
    }
  }
  
  return { gameStarted: updatedGameStarted };
}

export function handleHutInteraction(
  player: Player, 
  timeOfDay: number, 
  isNightTime: (time: number) => boolean
): { 
  shouldStartSleeping: boolean 
} {
  // Check if player is entering the hut at night
  if (player.checkForHutSleeping() && isNightTime(timeOfDay)) {
    return { shouldStartSleeping: true };
  }
  
  return { shouldStartSleeping: false };
}
