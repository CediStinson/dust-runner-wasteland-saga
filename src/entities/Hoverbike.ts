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
  smokeParticles: Array<{x: number, y: number, worldX: number, worldY: number, opacity: number, size: number, age: number}>;
  isRiding: boolean;

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
    this.smokeParticles = [];
    this.isRiding = false;
  }

  update() {
    if (this.player.riding) {
      this.isRiding = true;
      this.handleControls();
      this.applyMovement();
      this.checkCollisions();
      this.checkFuelRefill();
      this.updateSmokeParticles();
      
      if (this.collisionCooldown > 0) {
        this.collisionCooldown--;
      }
    } else {
      // Track that we're not riding anymore to handle smoke fade-out
      if (this.isRiding) {
        this.isRiding = false;
      }
      this.updateSmokeParticles();
    }
  }

  handleControls() {
    let acceleration = 0;
    
    // Only consume fuel when pressing Up or Down arrows
    if (this.p.keyIsDown(this.p.UP_ARROW) && this.fuel > 0) {
      acceleration = 0.1;
      
      // Only consume fuel when actively accelerating
      if (this.p.frameCount % 60 === 0) { // Every second
        const oldFuel = this.fuel;
        this.fuel = Math.max(0, this.fuel - 0.5);
        if (oldFuel !== this.fuel) {
          emitGameStateUpdate(this.player, this);
        }
      }
      
      // Generate smoke particles when accelerating - more consistent rate for smoother effect
      if (this.p.frameCount % 4 === 0) {
        this.addSmokeParticle();
      }
    } else if (this.p.keyIsDown(this.p.DOWN_ARROW)) {
      // If moving forward, brake first
      if (Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY) > 0.1) {
        // Calculate if we're moving mostly in the direction we're facing
        const movementAngle = Math.atan2(this.velocityY, this.velocityX);
        const angleDifference = Math.abs((movementAngle - this.angle + Math.PI * 2) % (Math.PI * 2));
        
        if (angleDifference < Math.PI / 2 || angleDifference > Math.PI * 3 / 2) {
          // We're moving forward, apply braking
          acceleration = -0.05;
        } else {
          // We're already moving backward, accelerate backward
          acceleration = -0.1;
          
          // Consume fuel for reverse movement
          if (this.p.frameCount % 60 === 0 && this.fuel > 0) {
            const oldFuel = this.fuel;
            this.fuel = Math.max(0, this.fuel - 0.5);
            if (oldFuel !== this.fuel) {
              emitGameStateUpdate(this.player, this);
            }
          }
        }
      } else {
        // If not moving or very slow, go in reverse
        acceleration = -0.1;
        
        // Consume fuel for reverse movement
        if (this.p.frameCount % 60 === 0 && this.fuel > 0) {
          const oldFuel = this.fuel;
          this.fuel = Math.max(0, this.fuel - 0.5);
          if (oldFuel !== this.fuel) {
            emitGameStateUpdate(this.player, this);
          }
        }
        
        // Generate smoke for reverse too - more consistent rate
        if (this.p.frameCount % 5 === 0) {
          this.addSmokeParticle();
        }
      }
    }
    
    // Store acceleration for particle effects
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
  
  updateSmokeParticles() {
    // Update existing smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const particle = this.smokeParticles[i];
      
      // Age the particle
      particle.age += 1;
      
      // Calculate fade rate based on riding state
      const fadeRate = this.isRiding ? 0.8 : 2.0; // Fade faster when dismounted
      
      // Smoother fade
      particle.opacity -= fadeRate;
      particle.size += 0.12; // Slower growth for smoother effect
      
      if (particle.opacity <= 0) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }
  
  addSmokeParticle() {
    // Calculate position behind the hoverbike (opposing the direction of travel)
    const offsetDistance = 20;
    const smokeX = -offsetDistance * Math.cos(this.angle);
    const smokeY = -offsetDistance * Math.sin(this.angle);
    
    // Add minimal randomness to the position for a smoother trail
    const jitter = 1.5;
    const randomX = this.p.random(-jitter, jitter);
    const randomY = this.p.random(-jitter, jitter);
    
    this.smokeParticles.push({
      x: smokeX + randomX,
      y: smokeY + randomY,
      worldX: this.worldX,
      worldY: this.worldY,
      opacity: 150, // Start with lower opacity for subtler effect
      size: this.p.random(3, 4),
      age: 0
    });
  }

  applyMovement() {
    // Check for collisions with the hut before moving
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
          collisionRadius = 30; // Hut collision radius
        } else if (obs.type === 'fuelPump') {
          collisionRadius = 25; // Fuel pump collision radius
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
    // Only check for refill if we have fuel less than max
    if (this.fuel >= this.maxFuel) return;
    
    let currentObstacles = this.obstacles[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'fuelPump') {
        let dx = this.x - obs.x;
        let dy = this.y - obs.y;
        let distance = this.p.sqrt(dx * dx + dy * dy);
        
        // If close to fuel pump, refill fuel at a reasonable rate
        if (distance < 40 && this.fuel < this.maxFuel) {
          const oldFuel = this.fuel;
          this.fuel = Math.min(this.maxFuel, this.fuel + 0.5);
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
      this.p.rotate(this.angle); // Remove the PI/2 rotation so it faces the direction of travel
      
      // Draw smoke particles (behind the hoverbike)
      this.p.noStroke(); // No outline for smoke
      for (const particle of this.smokeParticles) {
        // Only draw particles in the current world cell
        if (particle.worldX === this.worldX && particle.worldY === this.worldY) {
          // Simple line-like smoke effect - more consistent coloring
          const smokeGray = 150 + this.p.map(particle.age, 0, 50, 0, 30); // Smoother color transition
          this.p.fill(smokeGray, smokeGray, smokeGray, particle.opacity);
          // Draw elongated particle (more like a line)
          this.p.ellipse(particle.x, particle.y, particle.size * 1.5, particle.size * 0.8);
        }
      }
      
      // Main body - hoverbike with correct orientation (front facing forward, back in the rear)
      // First layer - base chassis (gray metallic)
      this.p.stroke(0); // Add black outlines back
      this.p.strokeWeight(1);
      this.p.fill(130, 130, 140);
      this.p.beginShape();
      this.p.vertex(20, 0);     // Front point
      this.p.vertex(16, 6);     // Front right
      this.p.vertex(0, 8);      // Mid right
      this.p.vertex(-16, 6);    // Rear right
      this.p.vertex(-16, -6);   // Rear left
      this.p.vertex(0, -8);     // Mid left
      this.p.vertex(16, -6);    // Front left
      this.p.endShape(this.p.CLOSE);
      
      // Central section (seat and controls)
      this.p.fill(80, 80, 90);
      this.p.beginShape();
      this.p.vertex(14, 0);     // Front
      this.p.vertex(10, 5);     // Front right
      this.p.vertex(-6, 6);     // Mid right
      this.p.vertex(-10, 4);    // Rear right
      this.p.vertex(-10, -4);   // Rear left
      this.p.vertex(-6, -6);    // Mid left
      this.p.vertex(10, -5);    // Front left
      this.p.endShape(this.p.CLOSE);
      
      // Seat
      this.p.fill(60, 60, 65);
      this.p.ellipse(0, 0, 14, 10);
      
      // Handlebars
      this.p.stroke(70, 70, 75);
      this.p.strokeWeight(2);
      this.p.line(8, -4, 6, -8);
      this.p.line(8, 4, 6, 8);
      this.p.strokeWeight(1);
      
      // Handlebar grips
      this.p.fill(40, 40, 45);
      this.p.ellipse(6, -8, 4, 3);
      this.p.ellipse(6, 8, 4, 3);
      
      // Front lights
      this.p.fill(200, 200, 100);
      this.p.ellipse(18, 0, 6, 3);
      
      // Jet engine at the back
      this.p.fill(90, 90, 95);
      this.p.beginShape();
      this.p.vertex(-14, -6);  // Top edge of engine
      this.p.vertex(-14, 6);   // Bottom edge of engine
      this.p.vertex(-20, 5);   // Bottom exhaust
      this.p.vertex(-20, -5);  // Top exhaust
      this.p.endShape(this.p.CLOSE);
      
      // Engine details
      this.p.fill(50, 50, 55);
      this.p.rect(-15, -4, 4, 8, 1);
      
      // Exhaust flame
      this.p.noStroke();
      this.p.fill(255, 150, 50, 150 + this.p.sin(this.p.frameCount * 0.2) * 50);
      this.p.ellipse(-22, 0, 4, 8);
      this.p.fill(255, 200, 100, 100 + this.p.sin(this.p.frameCount * 0.2) * 50);
      this.p.ellipse(-24, 0, 3, 5);
      
      // Side panels with makeshift repairs
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
      
      // Bolts and rivets
      this.p.fill(60, 60, 65);
      this.p.ellipse(-8, -8, 2, 2);
      this.p.ellipse(0, -8, 2, 2);
      this.p.ellipse(8, -8, 2, 2);
      this.p.ellipse(-8, 8, 2, 2);
      this.p.ellipse(0, 8, 2, 2);
      this.p.ellipse(8, 8, 2, 2);
      
      // Wires and hoses
      this.p.stroke(40, 40, 45);
      this.p.strokeWeight(1);
      this.p.line(-8, -6, -14, -4);
      this.p.line(-8, -2, -14, -2);
      this.p.line(-8, 2, -14, 2);
      this.p.line(-8, 6, -14, 4);
      
      // Shadow
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

  // Add the render method that just calls the display method
  render() {
    this.display();
  }
}
