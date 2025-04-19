
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
    // If not digging, return early with current state
    if (!digging) return { 
      digging: false, 
      isDigging: true, // Always true since it's required by the type
      digTimer, 
      digTarget, 
      inventory 
    };
    
    let newDigTimer = digTimer + 1;
    let newInventory = { ...inventory };
    
    // Check if digging is complete
    if (newDigTimer >= 480) {
      newInventory.copper += p.floor(p.random(1, 4));
      
      let currentResources = resources[`${worldX},${worldY}`];
      if (currentResources) {
        let index = currentResources.indexOf(digTarget);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
      }
      
      emitGameStateUpdate(player, hoverbike);
      
      return {
        digging: false,
        isDigging: true, // Always true since it's required by the type
        digTimer: 0,
        digTarget: null,
        inventory: newInventory
      };
    }
    
    // Check if digging should be cancelled
    if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(p.DOWN_ARROW) || 
        p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(p.RIGHT_ARROW) ||
        !digTarget || p.dist(x, y, digTarget.x, digTarget.y) > 30) {
      
      return {
        digging: false,
        isDigging: true, // Always true since it's required by the type
        digTimer: 0,
        digTarget: null,
        inventory
      };
    }
    
    // Continue digging
    return {
      digging: true,
      isDigging: true,
      digTimer: newDigTimer,
      digTarget,
      inventory
    };
  }
  
  displayDigProgress(p: any, digTimer: number, digTarget: any): void {
    if (!digTarget) return;
    
    const progress = digTimer / 480;
    const barWidth = 30;
    
    p.push();
    p.translate(digTarget.x, digTarget.y - 15);
    
    p.fill(0, 0, 0, 150);
    p.rect(-barWidth/2, 0, barWidth, 4, 2);
    
    p.fill(220, 170, 50);
    p.rect(-barWidth/2, 0, barWidth * progress, 4, 2);
    
    p.fill(255);
    p.textAlign(p.CENTER);
    p.textSize(8);
    p.text("Digging...", 0, -5);
    
    p.pop();
  }
}
