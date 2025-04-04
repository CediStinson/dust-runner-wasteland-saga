
import { emitGameStateUpdate } from '../../utils/gameUtils';

export default class PlayerResources {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  checkForCollectableResources(player: any) {
    // Only check for nearby resources
    let currentResources = player.resources[`${player.worldX},${player.worldY}`] || [];
    
    // Visual indicator for resources within collection range
    for (let res of currentResources) {
      if (res.type === 'metal' && this.p.dist(player.x, player.y, res.x, res.y) < 30) {
        player.renderer.drawResourceIndicator(res.x, res.y);
      }
    }
  }

  collectResource(player: any) {
    let currentResources = player.resources[`${player.worldX},${player.worldY}`] || [];
    
    // Check for metal to collect
    for (let i = currentResources.length - 1; i >= 0; i--) {
      let res = currentResources[i];
      if (res.type === 'metal' && this.p.dist(player.x, player.y, res.x, res.y) < 30) {
        player.inventory.metal++;
        currentResources.splice(i, 1);
        // Send immediate update
        emitGameStateUpdate(player, player.hoverbike);
      }
    }
    
    // Check for copper ore to mine
    if (!player.digging) {
      for (let i = 0; i < currentResources.length; i++) {
        let res = currentResources[i];
        if (res.type === 'copper' && this.p.dist(player.x, player.y, res.x, res.y) < 30) {
          this.startDigging(player, res);
          break;
        }
      }
    }
  }
  
  startDigging(player: any, target: any) {
    player.digging = true;
    player.digTimer = 0;
    player.digTarget = target;
    emitGameStateUpdate(player, player.hoverbike);
  }
  
  updateDigging(player: any) {
    if (!player.digging) return;
    
    player.digTimer++;
    
    // 8 seconds (60fps * 8 = 480 frames)
    if (player.digTimer >= 480) {
      // Mining complete
      player.digging = false;
      
      // Add 1-3 copper to inventory
      let copperAmount = this.p.floor(this.p.random(1, 4));
      player.inventory.copper += copperAmount;
      
      // Remove the ore from resources
      let currentResources = player.resources[`${player.worldX},${player.worldY}`];
      if (currentResources) {
        let index = currentResources.indexOf(player.digTarget);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
      }
      
      player.digTarget = null;
      emitGameStateUpdate(player, player.hoverbike);
    }
    
    // Cancel digging if player moves or is too far from target
    if (this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(this.p.DOWN_ARROW) || 
        this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(this.p.RIGHT_ARROW) ||
        !player.digTarget || this.p.dist(player.x, player.y, player.digTarget.x, player.digTarget.y) > 30) {
      player.digging = false;
      player.digTarget = null;
    }
  }
}
