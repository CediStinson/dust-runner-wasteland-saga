
import p5 from 'p5';
import { PlayerInventory } from '../../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class DiggingService {
  updateDigging(
    digging: boolean,
    digTimer: number,
    digTarget: any,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
    resources: Record<string, any[]>,
    inventory: PlayerInventory,
    player: any,
    hoverbike: any,
    p: any
  ): {
    digging: boolean,
    isDigging: boolean,
    digTimer: number,
    digTarget: any | null,
    inventory: PlayerInventory
  } {
    if (!digging) return { 
      digging: false, 
      isDigging: false, 
      digTimer, 
      digTarget, 
      inventory 
    };
    
    let newDigTimer = digTimer + 1;
    let newDigging = digging;
    let newIsDigging = true; // Always true when in digging state
    let newDigTarget = digTarget;
    let newInventory = { ...inventory };
    
    if (newDigTimer >= 480) {
      newDigging = false;
      newIsDigging = false; // This is correct as digging is complete
      
      let copperAmount = p.floor(p.random(1, 4));
      newInventory.copper += copperAmount;
      
      let currentResources = resources[`${worldX},${worldY}`];
      if (currentResources) {
        let index = currentResources.indexOf(digTarget);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
      }
      
      newDigTarget = null;
      emitGameStateUpdate(player, hoverbike);
    }
    
    if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(p.DOWN_ARROW) || 
        p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(p.RIGHT_ARROW) ||
        !digTarget || p.dist(x, y, digTarget.x, digTarget.y) > 30) {
      newDigging = false;
      newIsDigging = false; // This is correct as digging is interrupted
      newDigTarget = null;
    }
    
    return {
      digging: newDigging,
      isDigging: newIsDigging,
      digTimer: newDigTimer,
      digTarget: newDigTarget,
      inventory: newInventory
    };
  }
  
  displayDigProgress(p: any, digTimer: number, digTarget: any): void {
    if (!digTarget) return;
    
    const progress = digTimer / 480;
    const barWidth = 30;
    
    p.push();
    p.translate(digTarget.x, digTarget.y - 15);
    
    // Draw progress bar background
    p.fill(0, 0, 0, 150);
    p.rect(-barWidth/2, 0, barWidth, 4, 2);
    
    // Draw progress
    p.fill(220, 170, 50);
    p.rect(-barWidth/2, 0, barWidth * progress, 4, 2);
    
    // Draw digging text
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textSize(8);
    p.text("Digging...", 0, -5);
    
    p.pop();
  }
}
