
import p5 from 'p5';
import { HoverbikeState } from '../../types/HoverbikeTypes';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export class MovementController {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  handleControls(state: HoverbikeState, player: any): HoverbikeState {
    let newState = { ...state };
    let acceleration = 0;
    
    if (this.p.keyIsDown(this.p.UP_ARROW) && newState.fuel > 0) {
      acceleration = 0.025;
      
      if (this.p.frameCount % 30 === 0) {
        const oldFuel = newState.fuel;
        newState.fuel = Math.max(0, newState.fuel - 1);
        if (oldFuel !== newState.fuel) {
          emitGameStateUpdate(player, newState);
        }
      }
    } else if (this.p.keyIsDown(this.p.DOWN_ARROW) && newState.fuel > 0) {
      acceleration = -0.0125;
      
      if (this.p.frameCount % 30 === 0) {
        const oldFuel = newState.fuel;
        newState.fuel = Math.max(0, newState.fuel - 0.75);
        if (oldFuel !== newState.fuel) {
          emitGameStateUpdate(player, newState);
        }
      }
    }
    
    newState.previousAcceleration = acceleration;

    let turningVelocity = 0;
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) {
      turningVelocity = newState.fuel > 0 ? -0.02 : -0.005;
    }
    else if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
      turningVelocity = newState.fuel > 0 ? 0.02 : 0.005;
    }

    newState.angle += turningVelocity;
    
    if (newState.fuel > 0) {
      newState.velocityX += this.p.cos(newState.angle) * acceleration;
      newState.velocityY += this.p.sin(newState.angle) * acceleration;
    }
    
    newState.velocityX *= 0.99;
    newState.velocityY *= 0.99;
    
    return newState;
  }

  applyMovement(state: HoverbikeState, obstacles: Record<string, any[]>): HoverbikeState {
    let newState = { ...state };
    let currentObstacles = obstacles[`${newState.worldX},${newState.worldY}`] || [];
    let willCollide = false;
    let newX = newState.x + newState.velocityX;
    let newY = newState.y + newState.velocityY;
    
    for (let obs of currentObstacles) {
      if (obs.type === 'hut' || obs.type === 'rock' || obs.type === 'fuelPump') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        
        let collisionRadius = 0;
        if (obs.type === 'rock') {
          let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
          let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
          collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.2;
        } else if (obs.type === 'hut') {
          collisionRadius = 30;
        } else if (obs.type === 'fuelPump') {
          collisionRadius = 35;
        }
        
        let distance = this.p.sqrt(dx * dx + dy * dy);
        if (distance < collisionRadius) {
          willCollide = true;
          newState.velocityX = -newState.velocityX * 0.5;
          newState.velocityY = -newState.velocityY * 0.5;
          break;
        }
      }
    }
    
    if (!willCollide) {
      newState.x += newState.velocityX;
      newState.y += newState.velocityY;
    }
    
    return newState;
  }
}
