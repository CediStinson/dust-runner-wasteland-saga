import p5 from 'p5';
import { HoverbikeType } from '../utils/gameUtils';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Hoverbike implements HoverbikeType {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  velocityX: number;
  velocityY: number;
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

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, player: any) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.player = player;
    this.angle = 0;
    this.velocityX = 0;
    this.velocityY = 0;
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
  }

  update() {
    if (this.player.riding) {
      this.isRiding = true;
      this.handleControls();
      this.applyMovement();
      this.checkCollisions();
      
      const currentSpeed = Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY);
      const targetIntensity = currentSpeed * 3;
      this.thrustIntensity = this.p.lerp(this.thrustIntensity, targetIntensity, 0.1);
      
      if (this.collisionCooldown > 0) {
        this.collisionCooldown--;
      }
    } else {
      this.isRiding = false;
      this.thrustIntensity = 0;
      this.checkFuelRefill();
    }
  }

  handleControls() {
    let acceleration = 0;
    
    if (this.p.keyIsDown(this.p.UP_ARROW) && this.fuel > 0) {
      acceleration = 0.1;
      
      if (this.p.frameCount % 60 === 0) {
        const oldFuel = this.fuel;
        this.fuel = Math.max(0, this.fuel - 0.5);
        if (oldFuel !== this.fuel) {
          emitGameStateUpdate(this.player, this);
        }
      }
    } else if (this.p.keyIsDown(this.p.DOWN_ARROW)) {
      if (Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) > 0.1) {
        const movementAngle = Math.atan2(this.velocityY, this.velocityX);
        const angleDifference = Math.abs((movementAngle - this.angle + Math.PI * 2) % (Math.PI * 2));
        
        if (angleDifference < Math.PI / 2 || angleDifference > Math.PI * 3 / 2) {
          acceleration = -0.05;
        } else {
          acceleration = -0.1;
          
          if (this.p.frameCount % 60 === 0 && this.fuel > 0) {
            const oldFuel = this.fuel;
            this.fuel = Math.max(0, this.fuel - 0.5);
            if (oldFuel !== this.fuel) {
              emitGameStateUpdate(this.player, this);
            }
          }
        }
      } else {
        acceleration = -0.1;
        
        if (this.p.frameCount % 60 === 0 && this.fuel > 0) {
          const oldFuel = this.fuel;
          this.fuel = Math.max(0, this.fuel - 0.5);
          if (oldFuel !== this.fuel) {
            emitGameStateUpdate(this.player, this);
          }
        }
      }
    }
    
    this.previousAcceleration = acceleration;

    let turningVelocity = 0;
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) turningVelocity = -0.03;
    else if (this.p.keyIsDown(this.p.RIGHT_ARROW)) turningVelocity = 0.03;

    this.angle += turningVelocity;
    this.velocityX += this.p.cos(this.angle) * acceleration;
    this.velocityY += this.p.sin(this.angle) * acceleration;
    this.velocityX *= 0.95;
    this.velocityY *= 0.95;
  }

  applyMovement() {
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    let willCollide = false;
    let newX = this.x + this.velocityX;
    let newY = this.y + this.velocityY;
    
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
          this.velocityX = -this.velocityX * 0.5;
          this.velocityY = -this.velocityY * 0.5;
          break;
        }
      }
    }
    
    if (!willCollide) {
      this.x += this.velocityX;
      this.y += this.velocityY;
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
          this.velocityX = -this.velocityX * 0.5;
          this.velocityY = -this.velocityY * 0.5;
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
          this.velocityX *= 0.8;
          this.velocityY *= 0.8;
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
          this.fuel = Math.min(this.maxFuel, this.fuel + 0.3);
          if (oldFuel !== this.fuel && this.p.frameCount % 10 === 0) {
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
      
      if (this.isRiding) {
        this.p.noStroke();
        
        const minExhaustLength = 5;
        const maxExhaustLength = 25;
        const exhaustLength = this.p.map(this.thrustIntensity, 0, 5, minExhaustLength, maxExhaustLength);
        const flameWidth = 4;
        
        this.p.fill(255, 50, 50, 200 + this.p.sin(this.p.frameCount * 0.3) * 55);
        this.p.ellipse(-28, 0, flameWidth, exhaustLength);
        
        this.p.fill(255, 200, 100, 100 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(-28, 0, flameWidth * 0.75, exhaustLength * 1.2);
        
        this.p.fill(255, 150, 50, 150 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(-28, 0, flameWidth * 0.5, exhaustLength * 1.5);
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

  setWorldCoordinates(x: number, y: number) {
    this.worldX = x;
    this.worldY = y;
  }
}
