
import { emitGameStateUpdate } from '../../utils/gameUtils';

export default class PlayerHealth {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  checkCactusDamage(player: any) {
    // Check if player is touching a cactus
    if (player.riding) return; // No damage when riding hoverbike
    
    let currentObstacles = player.obstacles[`${player.worldX},${player.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'cactus') {
        let dx = player.x - obs.x;
        let dy = player.y - obs.y;
        let hitboxWidth = 15 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          // Only apply damage every 30 frames (0.5 seconds) to avoid rapid damage
          if (player.cactusDamageTimer <= 0) {
            const oldHealth = player.health;
            player.health = this.p.max(0, player.health - 2); // Do 2 damage points
            if (oldHealth !== player.health) {
              emitGameStateUpdate(player, player.hoverbike);
              player.cactusDamageTimer = 30; // Reset cooldown timer
            }
          }
          break;
        }
      }
    }
  }

  updateDamageTimer(player: any) {
    if (player.cactusDamageTimer > 0) {
      player.cactusDamageTimer--;
    }
  }
}
