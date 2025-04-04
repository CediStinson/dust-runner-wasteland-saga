
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
  }

  update() {
    if (this.player.riding) {
      this.handleControls();
      this.applyMovement();
      this.checkCollisions();
      if (this.collisionCooldown > 0) {
        this.collisionCooldown--;
      }
      
      // Consume fuel while riding
      if (this.p.frameCount % 60 === 0) { // Every second
        const oldFuel = this.fuel;
        this.fuel = Math.max(0, this.fuel - 0.5);
        if (oldFuel !== this.fuel) {
          emitGameStateUpdate(this.player, this);
        }
      }
    }
  }

  handleControls() {
    let acceleration = 0;
    if (this.p.keyIsDown(this.p.UP_ARROW)) acceleration = 0.1;
    else if (this.p.keyIsDown(this.p.DOWN_ARROW)) acceleration = -0.1;

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
    // Check for collisions with the hut before moving
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    let willCollide = false;
    let newX = this.x + this.velocityX;
    let newY = this.y + this.velocityY;
    
    for (let obs of currentObstacles) {
      if (obs.type === 'hut' || obs.type === 'rock') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        
        let collisionRadius = 0;
        if (obs.type === 'rock') {
          let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
          let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
          collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
        } else if (obs.type === 'hut') {
          collisionRadius = 30; // Hut collision radius
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

  display() {
    if (this.worldX === this.player.worldX && this.worldY === this.player.worldY) {
      this.p.push();
      this.p.translate(this.x, this.y);
      this.p.rotate(this.angle);
      
      // Main body - slimmer futuristic hoverbike rotated 90 degrees
      // First layer - base chassis (gray metallic)
      this.p.fill(130, 130, 140);
      this.p.beginShape();
      this.p.vertex(0, -20);     // Front point
      this.p.vertex(-6, -16);    // Front left
      this.p.vertex(-8, 0);      // Mid left
      this.p.vertex(-6, 16);     // Rear left
      this.p.vertex(6, 16);      // Rear right
      this.p.vertex(8, 0);       // Mid right
      this.p.vertex(6, -16);     // Front right
      this.p.endShape(this.p.CLOSE);
      
      // Central section (seat and controls)
      this.p.fill(80, 80, 90);
      this.p.beginShape();
      this.p.vertex(0, -14);    // Front
      this.p.vertex(-5, -10);   // Front left
      this.p.vertex(-6, 6);     // Mid left
      this.p.vertex(-4, 10);    // Rear left
      this.p.vertex(4, 10);     // Rear right
      this.p.vertex(6, 6);      // Mid right
      this.p.vertex(5, -10);    // Front right
      this.p.endShape(this.p.CLOSE);
      
      // Seat
      this.p.fill(60, 60, 65);
      this.p.ellipse(0, 0, 10, 14);
      
      // Handlebars
      this.p.stroke(70, 70, 75);
      this.p.strokeWeight(2);
      this.p.line(-4, -8, -8, -6);
      this.p.line(4, -8, 8, -6);
      this.p.noStroke();
      
      // Handlebar grips
      this.p.fill(40, 40, 45);
      this.p.ellipse(-8, -6, 3, 4);
      this.p.ellipse(8, -6, 3, 4);
      
      // Front lights
      this.p.fill(200, 200, 100);
      this.p.ellipse(0, -18, 3, 6);
      
      // Jet engine at the back
      this.p.fill(90, 90, 95);
      this.p.beginShape();
      this.p.vertex(-6, 14);  // Left edge of engine
      this.p.vertex(6, 14);   // Right edge of engine
      this.p.vertex(5, 20);   // Right exhaust
      this.p.vertex(-5, 20);  // Left exhaust
      this.p.endShape(this.p.CLOSE);
      
      // Engine details
      this.p.fill(50, 50, 55);
      this.p.rect(-4, 15, 8, 4, 1);
      
      // Exhaust flame
      this.p.fill(255, 150, 50, 150 + this.p.sin(this.p.frameCount * 0.2) * 50);
      this.p.ellipse(0, 22, 8, 4);
      this.p.fill(255, 200, 100, 100 + this.p.sin(this.p.frameCount * 0.2) * 50);
      this.p.ellipse(0, 24, 5, 3);
      
      // Side panels with makeshift repairs
      this.p.fill(100, 100, 110);
      this.p.beginShape();
      this.p.vertex(-8, -5);
      this.p.vertex(-10, 0);
      this.p.vertex(-8, 5);
      this.p.endShape(this.p.CLOSE);
      
      this.p.beginShape();
      this.p.vertex(8, -5);
      this.p.vertex(10, 0);
      this.p.vertex(8, 5);
      this.p.endShape(this.p.CLOSE);
      
      // Bolts and rivets
      this.p.fill(60, 60, 65);
      this.p.ellipse(-8, -8, 2, 2);
      this.p.ellipse(-8, 0, 2, 2);
      this.p.ellipse(-8, 8, 2, 2);
      this.p.ellipse(8, -8, 2, 2);
      this.p.ellipse(8, 0, 2, 2);
      this.p.ellipse(8, 8, 2, 2);
      
      // Wires and hoses
      this.p.stroke(40, 40, 45);
      this.p.strokeWeight(1);
      this.p.line(-6, 8, -4, 14);
      this.p.line(-2, 8, -2, 14);
      this.p.line(2, 8, 2, 14);
      this.p.line(6, 8, 4, 14);
      this.p.noStroke();
      
      // Shadow
      this.p.fill(50, 50, 60, 100);
      this.p.ellipse(0, 20, 25, 6);
      
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
