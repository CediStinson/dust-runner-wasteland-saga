
import p5 from 'p5';
import { HoverbikeState } from '../../types/HoverbikeTypes';
import { emitGameStateUpdate } from '../../utils/gameUtils';
import { createExplosion } from '../../game/world/WorldInteraction';

export class CollisionController {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  checkCollisions(state: HoverbikeState, obstacles: Record<string, any[]>, player: any): HoverbikeState {
    let newState = { ...state };
    
    if (newState.collisionCooldown > 0) return newState;

    let currentObstacles = obstacles[`${newState.worldX},${newState.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'rock') {
        let dx = newState.x - obs.x;
        let dy = newState.y - obs.y;
        let hitboxWidth = 30 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
        let hitboxHeight = 30 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
        let normalizedX = dx / hitboxWidth;
        let normalizedY = dy / hitboxHeight;
        let distance = this.p.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

        if (distance < 1) {
          const oldHealth = newState.health;
          newState.health = this.p.max(0, newState.health - 10);
          if (oldHealth !== newState.health) {
            emitGameStateUpdate(player, newState);
          }
          newState.velocityX = -newState.velocityX * 0.5;
          newState.velocityY = -newState.velocityY * 0.5;
          newState.collisionCooldown = 30;
          let pushDistance = (1 - distance) * 30;
          let pushX = normalizedX * pushDistance;
          let pushY = normalizedY * pushDistance;
          newState.x += pushX * hitboxWidth / 30;
          newState.y += pushY * hitboxHeight / 30;
          break;
        }
      } else if (obs.type === 'cactus') {
        let dx = newState.x - obs.x;
        let dy = newState.y - obs.y;
        let hitboxWidth = 20 * obs.size;
        let hitboxHeight = 20 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);

        if (distance < hitboxWidth) {
          const oldHealth = newState.health;
          newState.health = this.p.max(0, newState.health - 3);
          if (oldHealth !== newState.health) {
            emitGameStateUpdate(player, newState);
          }
          newState.velocityX *= 0.8;
          newState.velocityY *= 0.8;
          newState.collisionCooldown = 20;
          let pushDistance = (hitboxWidth - distance);
          let pushX = (dx / distance) * pushDistance;
          let pushY = (dy / distance) * pushDistance;
          newState.x += pushX;
          newState.y += pushY;
          break;
        }
      } else if (obs.type === 'fuelCanister' && !obs.collected) {
        let dx = newState.x - obs.x;
        let dy = newState.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);

        if (distance < 20) {
          obs.collected = true;
          
          // Create explosion with the imported function instead of trying to use player.game.createExplosion
          if (player && player.game) {
            const renderer = player.game.renderer;
            createExplosion(this.p, obs.x, obs.y, newState.worldX, newState.worldY, obstacles, renderer);
            
            const oldHealth = newState.health;
            newState.health = this.p.max(0, newState.health - 15);
            if (oldHealth !== newState.health) {
              emitGameStateUpdate(player, newState);
            }
            
            const knockbackForce = 3;
            let angle = this.p.atan2(dy, dx);
            newState.velocityX += this.p.cos(angle) * knockbackForce;
            newState.velocityY += this.p.sin(angle) * knockbackForce;
            
            newState.collisionCooldown = 30;
          }
          
          const index = currentObstacles.indexOf(obs);
          if (index !== -1) {
            currentObstacles.splice(index, 1);
          }
          break;
        }
      }
    }
    
    return newState;
  }

  checkFuelRefill(state: HoverbikeState, obstacles: Record<string, any[]>, player: any): HoverbikeState {
    let newState = { ...state };
    
    if (newState.fuel >= newState.maxFuel) return newState;
    
    if (player.riding) return newState;
    
    let currentObstacles = obstacles[`${newState.worldX},${newState.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'fuelPump') {
        let dx = newState.x - obs.x;
        let dy = newState.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < 70 && newState.fuel < newState.maxFuel) {
          const oldFuel = newState.fuel;
          newState.fuel = Math.min(newState.maxFuel, newState.fuel + 0.1);
          
          if (oldFuel !== newState.fuel && this.p.frameCount % 5 === 0) {
            emitGameStateUpdate(player, newState);
          }
        }
      }
    }
    
    return newState;
  }
}
