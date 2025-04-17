
import { emitGameStateUpdate } from '../../../utils/gameUtils';

export class PlayerDamageHandler {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  handleCactusDamage(
    player: any,
    hoverbike: any,
    obstacles: Record<string, any[]>,
    worldX: number,
    worldY: number,
    x: number,
    y: number,
    cactusDamageCooldown: number
  ): { cactusDamageCooldown: number } {
    let newCactusDamageCooldown = cactusDamageCooldown;
    
    if (newCactusDamageCooldown > 0) {
      newCactusDamageCooldown--;
      return { cactusDamageCooldown: newCactusDamageCooldown };
    }
    
    let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'cactus') {
        let dx = x - obs.x;
        let dy = y - obs.y;
        let hitboxWidth = 20 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          newCactusDamageCooldown = this.applyCactusDamage(player, hoverbike);
          break;
        }
      }
    }
    
    return { cactusDamageCooldown: newCactusDamageCooldown };
  }
  
  applyCactusDamage(player: any, hoverbike: any): number {
    const oldHealth = player.health;
    player.health = this.p.max(0, player.health - 5);
    
    if (oldHealth !== player.health) {
      emitGameStateUpdate(player, hoverbike);
    }
    
    return 60; // Cooldown time
  }
}
