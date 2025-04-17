
import p5 from 'p5';

export class PlayerMovementController {
  private p: any;
  private speed: number = 0.5;
  private turnSpeed: number = 0.15;

  constructor(p: any) {
    this.p = p;
  }

  handleInput(state: any, carryingFuelCanister: boolean): { velX: number; velY: number; angle: number } {
    let moveX = 0, moveY = 0;
    let { velX, velY, angle, lastAngle } = state;

    if (this.p.keyIsDown(this.p.UP_ARROW)) moveY -= this.speed;
    if (this.p.keyIsDown(this.p.DOWN_ARROW)) moveY += this.speed;
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) moveX -= this.speed;
    if (this.p.keyIsDown(this.p.RIGHT_ARROW)) moveX += this.speed;

    let magnitude = this.p.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
      
      lastAngle = angle;
      
      const targetAngle = this.p.atan2(moveY, moveX);
      
      const angleDiff = targetAngle - angle;
      
      if (angleDiff > Math.PI) {
        angle += (targetAngle - angle - 2 * Math.PI) * this.turnSpeed;
      } else if (angleDiff < -Math.PI) {
        angle += (targetAngle - angle + 2 * Math.PI) * this.turnSpeed;
      } else {
        angle += angleDiff * this.turnSpeed;
      }
    }

    velX += moveX * this.speed * 0.2;
    velY += moveY * this.speed * 0.2;

    return { velX, velY, angle };
  }

  applyFriction(velX: number, velY: number): { velX: number; velY: number } {
    return {
      velX: velX * 0.9,
      velY: velY * 0.9
    };
  }

  checkCollisions(
    x: number, 
    y: number, 
    velX: number, 
    velY: number, 
    worldX: number, 
    worldY: number, 
    obstacles: Record<string, any[]>,
    resources: Record<string, any[]>,
    carryingFuelCanister: boolean,
    applyCactusDamage: () => void
  ): { x: number; y: number; velX: number; velY: number } {
    let willCollide = false;
    let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    let currentResources = resources[`${worldX},${worldY}`] || [];
    let newX = x + velX;
    let newY = y + velY;
    
    // Check collision with obstacles
    for (let obs of currentObstacles) {
      if (obs.type === 'rock' || obs.type === 'hut' || obs.type === 'fuelPump') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        
        let collisionRadius = 0;
        if (obs.type === 'rock') {
          let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
          let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
          collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
        } else if (obs.type === 'hut') {
          collisionRadius = 40;
        } else if (obs.type === 'fuelPump') {
          collisionRadius = 45;
        }
        
        let distance = this.p.sqrt(dx * dx + dy * dy);
        if (distance < collisionRadius) {
          willCollide = true;
          break;
        }
      } else if (obs.type === 'cactus') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        let hitboxWidth = 15 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < hitboxWidth) {
          willCollide = true;
          applyCactusDamage();
          break;
        }
      } else if (obs.type === 'fuelCanister' && !obs.collected) {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < 15) {
          willCollide = true;
          break;
        }
      }
    }
    
    // Check collision with fuel canisters in resources
    if (!willCollide) {
      for (let res of currentResources) {
        if (res.type === 'fuelCanister' && !res.collected) {
          let dx = newX - res.x;
          let dy = newY - res.y;
          let distance = this.p.sqrt(dx * dx + dy * dy);
          
          if (distance < 15) {
            willCollide = true;
            break;
          }
        }
      }
    }
    
    if (!willCollide) {
      const speedMultiplier = carryingFuelCanister ? 0.7 : 1;
      return {
        x: x + velX * speedMultiplier,
        y: y + velY * speedMultiplier,
        velX,
        velY
      };
    } else {
      return {
        x,
        y,
        velX: velX * -0.5,
        velY: velY * -0.5
      };
    }
  }
}
