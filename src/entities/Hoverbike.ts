import p5 from 'p5';
import { HoverbikeType } from '../utils/gameUtils';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Hoverbike implements HoverbikeType {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  velX: number;
  velY: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  speed: number;
  speedLevel: number;
  durabilityLevel: number;
  collisionCooldown: number;
  p: any;
  obstacles: Record<string, any[]>;
  player: any;
  previousAcceleration: number;
  isRiding: boolean;
  thrustIntensity: number;
  flameLength: number;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, player: any) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.player = player;
    this.angle = 0;
    this.velX = 0;
    this.velY = 0;
    this.health = 100;
    this.maxHealth = 100;
    this.fuel = 100;
    this.maxFuel = 100;
    this.speed = 2;
    this.speedLevel = 0;
    this.durabilityLevel = 0;
    this.collisionCooldown = 0;
    this.previousAcceleration = 0;
    this.isRiding = false;
    this.thrustIntensity = 0;
    this.flameLength = 0;
  }

  update() {
    if (this.player.riding) {
      this.isRiding = true;
      this.handleControls();
      
      // Only apply movement if there's fuel
      if (this.fuel > 0) {
        this.applyMovement();
      } else {
        // Gradually slow down when out of fuel
        this.velX *= 0.95;
        this.velY *= 0.95;
      }
      
      this.checkCollisions();
      
      // Update flame length based on acceleration
      const currentSpeed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
      
      // Check if accelerating/decelerating based on key states
      if (this.p.keyIsDown(this.p.UP_ARROW) && this.fuel > 0) {
        // Accelerating - increase flame length
        const targetLength = currentSpeed * 4 + 5;
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.1);
      } else if (this.p.keyIsDown(this.p.DOWN_ARROW) && this.fuel > 0) {
        // Only allow braking/reversing if we have fuel
        const targetLength = Math.max(currentSpeed * 2, 3);
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.2);
      } else {
        // Coasting - gradually adjust flame based on current speed
        const targetLength = currentSpeed * 3;
        this.flameLength = this.p.lerp(this.flameLength, targetLength, 0.1);
      }
      
      // Ensure there's always a minimum flame when riding (unless no fuel)
      this.thrustIntensity = (this.fuel > 0) ? Math.max(2, this.flameLength) : 0;
      
      if (this.collisionCooldown > 0) {
        this.collisionCooldown--;
      }
    } else {
      // Turn off flame completely when not riding
      this.isRiding = false;
      this.thrustIntensity = 0;
      this.flameLength = 0;
      this.checkFuelRefill();
    }
  }

  handleControls() {
    let acceleration = 0;
    
    // Increased fuel consumption rate
    if (this.p.keyIsDown(this.p.UP_ARROW) && this.fuel > 0) {
      acceleration = 0.1;
      
      // More aggressive fuel consumption when accelerating
      if (this.p.frameCount % 30 === 0) {
        const oldFuel = this.fuel;
        this.fuel = Math.max(0, this.fuel - 1);
        if (oldFuel !== this.fuel) {
          emitGameStateUpdate(this.player, this);
        }
      }
    } else if (this.p.keyIsDown(this.p.DOWN_ARROW) && this.fuel > 0) {
      // If moving forward, brake first
      if (Math.sqrt(this.velX * this.velX + this.velY * this.velY) > 0.1) {
        // Calculate if we're moving mostly in the direction we're facing
        const movementAngle = Math.atan2(this.velY, this.velX);
        const angleDifference = Math.abs((movementAngle - this.angle + Math.PI * 2) % (Math.PI * 2));
        
        if (angleDifference < Math.PI / 2 || angleDifference > Math.PI * 3 / 2) {
          // We're moving forward, apply braking
          acceleration = -0.05;
        } else {
          // We're already moving backward, accelerate backward
          acceleration = -0.1;
          
          // Slightly reduced but still significant fuel consumption when braking
          if (this.p.frameCount % 30 === 0) {
            const oldFuel = this.fuel;
            this.fuel = Math.max(0, this.fuel - 0.75);
            if (oldFuel !== this.fuel) {
              emitGameStateUpdate(this.player, this);
            }
          }
        }
      } else {
        // If not moving or very slow, go in reverse
        acceleration = -0.1;
        
        // Slightly reduced but still significant fuel consumption when reversing
        if (this.p.frameCount % 30 === 0) {
          const oldFuel = this.fuel;
          this.fuel = Math.max(0, this.fuel - 0.75);
          if (oldFuel !== this.fuel) {
            emitGameStateUpdate(this.player, this);
          }
        }
      }
    }
    
    // Store acceleration for thrust effects
    this.previousAcceleration = acceleration;

    let turningVelocity = 0;
    // Allow turning even without fuel, but at a reduced rate if no fuel
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) {
      turningVelocity = this.fuel > 0 ? -0.03 : -0.01;
    }
    else if (this.p.keyIsDown(this.p.RIGHT_ARROW)) {
      turningVelocity = this.fuel > 0 ? 0.03 : 0.01;
    }

    this.angle += turningVelocity;
    
    // Only apply acceleration if we have fuel
    if (this.fuel > 0) {
      this.velX += this.p.cos(this.angle) * acceleration;
      this.velY += this.p.sin(this.angle) * acceleration;
    }
    
    this.velX *= 0.95;
    this.velY *= 0.95;
  }

  applyMovement() {
    // Check for collisions with the hut before moving
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    let willCollide = false;
    let newX = this.x + this.velX;
    let newY = this.y + this.velY;
    
    for (let obs of currentObstacles) {
      if (obs.type === 'hut' || obs.type === 'rock' || obs.type === 'fuelPump') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        
        let collisionRadius = 0;
        if (obs.type === 'rock') {
          let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
          let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
          collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
        } else if (obs.type === 'hut') {
          collisionRadius = 30;
        } else if (obs.type === 'fuelPump') {
          collisionRadius = 35;
        }
        
        let distance = this.p.sqrt(dx * dx + dy * dy);
        if (distance < collisionRadius) {
          willCollide = true;
          this.velX = -this.velX * 0.5;
          this.velY = -this.velY * 0.5;
          break;
        }
      }
    }
    
    if (!willCollide) {
      this.x += this.velX;
      this.y += this.velY;
    }
  }

  checkCollisions() {
    if (this.collisionCooldown > 0) return;

    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'rock') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let hitboxWidth = 30 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
        let hitboxHeight = 30 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
        let normalizedX = dx / hitboxWidth;
        let normalizedY = dy / hitboxHeight;
        let distance = this.p.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

        if (distance < 1) {
          const oldHealth = this.health;
          this.health = this.p.max(0, this.health - 10);
          if (oldHealth !== this.health) {
            emitGameStateUpdate(this.player, this);
          }
          this.velX = -this.velX * 0.5;
          this.velY = -this.velY * 0.5;
          this.collisionCooldown = 30;
          let pushDistance = (1 - distance) * 30;
          let pushX = normalizedX * pushDistance;
          let pushY = normalizedY * pushDistance;
          this.x += pushX * hitboxWidth / 30;
          this.y += pushY * hitboxHeight / 30;
          break;
        }
      } else if (obs.type === 'cactus') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let hitboxWidth = 20 * obs.size;
        let hitboxHeight = 20 * obs.size;
        let distance = this.p.sqrt(dx * dx + dy * dy);

        if (distance < hitboxWidth) {
          const oldHealth = this.health;
          this.health = this.p.max(0, this.health - 3);
          if (oldHealth !== this.health) {
            emitGameStateUpdate(this.player, this);
          }
          this.velX *= 0.8;
          this.velY *= 0.8;
          this.collisionCooldown = 20;
          let pushDistance = (hitboxWidth - distance);
          let pushX = (dx / distance) * pushDistance;
          let pushY = (dy / distance) * pushDistance;
          this.x += pushX;
          this.y += pushY;
          break;
        }
      }
    }
  }
  
  checkFuelRefill() {
    if (this.fuel >= this.maxFuel) return;
    
    if (this.player.riding) return;
    
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'fuelPump') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        if (distance < 70 && this.fuel < this.maxFuel) {
          const oldFuel = this.fuel;
          this.fuel = Math.min(this.maxFuel, this.fuel + 0.1);
          
          if (oldFuel !== this.fuel && this.p.frameCount % 5 === 0) {
            emitGameStateUpdate(this.player, this);
          }
        }
      }
    }
  }

  display() {
    if (this.worldX === this.player.worldX && this.worldY === this.player.worldY) {
      this.p.push();
      this.p.translate(this.x, this.y);
      this.p.rotate(this.angle);
      
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.fill(130, 130, 140);
      this.p.beginShape();
      this.p.vertex(20, 0);
      this.p.vertex(16, 6);
      this.p.vertex(0, 8);
      this.p.vertex(-16, 6);
      this.p.vertex(-16, -6);
      this.p.vertex(0, -8);
      this.p.vertex(16, -6);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(80, 80, 90);
      this.p.beginShape();
      this.p.vertex(14, 0);
      this.p.vertex(10, 5);
      this.p.vertex(-6, 6);
      this.p.vertex(-10, 4);
      this.p.vertex(-10, -4);
      this.p.vertex(-6, -6);
      this.p.vertex(10, -5);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(60, 60, 65);
      this.p.ellipse(0, 0, 14, 10);
      
      this.p.stroke(70, 70, 75);
      this.p.strokeWeight(2);
      this.p.line(8, -4, 6, -8);
      this.p.line(8, 4, 6, 8);
      this.p.strokeWeight(1);
      
      this.p.fill(40, 40, 45);
      this.p.ellipse(6, -8, 4, 3);
      this.p.ellipse(6, 8, 4, 3);
      
      this.p.fill(200, 200, 100);
      this.p.ellipse(18, 0, 6, 3);
      
      this.p.fill(90, 90, 95);
      this.p.beginShape();
      this.p.vertex(-14, -6);
      this.p.vertex(-14, 6);
      this.p.vertex(-20, 5);
      this.p.vertex(-20, -5);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(50, 50, 55);
      this.p.rect(-15, -4, 4, 8, 1);
      
      if (this.thrustIntensity > 0) {
        this.p.noStroke();
        
        const flameWidth = this.thrustIntensity;
        const flameHeight = 6;
        const flameX = -21 - (flameWidth / 2);
        
        this.p.fill(255, 150, 50, 150 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(flameX, 0, flameWidth, flameHeight);
        
        this.p.fill(255, 200, 100, 100 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(flameX - 1, 0, flameWidth * 0.7, flameHeight * 0.8);
        
        this.p.fill(255, 50, 50, 200 + this.p.sin(this.p.frameCount * 0.3) * 55);
        this.p.ellipse(flameX - 2, 0, flameWidth * 0.5, flameHeight * 0.6);
      }
      
      this.p.stroke(0);
      this.p.fill(100, 100, 110);
      this.p.beginShape();
      this.p.vertex(-5, -8);
      this.p.vertex(0, -10);
      this.p.vertex(5, -8);
      this.p.endShape(this.p.CLOSE);
      
      this.p.beginShape();
      this.p.vertex(-5, 8);
      this.p.vertex(0, 10);
      this.p.vertex(5, 8);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(60, 60, 65);
      this.p.ellipse(-8, -8, 2, 2);
      this.p.ellipse(0, -8, 2, 2);
      this.p.ellipse(8, -8, 2, 2);
      this.p.ellipse(-8, 8, 2, 2);
      this.p.ellipse(0, 8, 2, 2);
      this.p.ellipse(8, 8, 2, 2);
      
      this.p.stroke(40, 40, 45);
      this.p.strokeWeight(1);
      this.p.line(-8, -6, -14, -4);
      this.p.line(-8, -2, -14, -2);
      this.p.line(-8, 2, -14, 2);
      this.p.line(-8, 6, -14, 4);
      
      this.p.noStroke();
      this.p.fill(50, 50, 60, 100);
      this.p.ellipse(0, 0, 25, 20);
      
      this.p.pop();
    }
  }

  upgradeSpeed() {
    if (this.speedLevel < 3) {
      this.speedLevel++;
      this.speed += 0.5;
    }
  }

  upgradeDurability() {
    if (this.durabilityLevel < 3) {
      this.durabilityLevel++;
      this.maxHealth += 50;
      this.health += 50;
    }
  }

  resetSpeedUpgrades() {
    this.speedLevel = 0;
    this.speed = 2;
    this.durabilityLevel = 0;
    this.maxHealth = 100;
    this.health = 100;
    this.fuel = 100;
  }

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }
}
