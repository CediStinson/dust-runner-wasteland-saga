import p5 from 'p5';
import Player from './Player';

export default class Hoverbike {
  p: any;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  size: number;
  speed: number;
  maxSpeed: number;
  xSpeed: number;
  ySpeed: number;
  engineOn: boolean;
  fuel: number;
  maxFuel: number;
  fuelConsumptionRate: number;
  obstacles: Record<string, any[]>;
  player: Player;
  health: number;
  maxHealth: number;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, player: Player) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.size = 30;
    this.speed = 2;
    this.maxSpeed = 5;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.engineOn = false;
    this.fuel = 100;
    this.maxFuel = 100;
    this.fuelConsumptionRate = 0.01;
    this.obstacles = obstacles;
    this.player = player;
    this.health = 100;
    this.maxHealth = 100;
  }

  upgradeSpeed() {
    this.speed += 0.5;
    this.maxSpeed += 0.5;
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.rotate(this.p.atan2(this.ySpeed, this.xSpeed)); // Rotate towards movement direction
    this.p.fill(150);
    this.p.rect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
    this.p.fill(100);
    this.p.ellipse(0, 0, this.size / 2, this.size / 2);
    this.p.pop();
  }

  move() {
    if (this.engineOn && this.fuel > 0) {
      this.fuel -= this.fuelConsumptionRate;
      
      // Normalize the speed based on maxSpeed
      let normalizedSpeed = this.speed / this.maxSpeed;
      
      // Accelerate up to the max speed
      if (this.xSpeed < this.speed) {
        this.xSpeed += 0.1 * normalizedSpeed;
      }
      if (this.ySpeed < this.speed) {
        this.ySpeed += 0.1 * normalizedSpeed;
      }
      
      this.x += this.xSpeed;
      this.y += this.ySpeed;
    } else {
      // Gradual deceleration
      if (this.xSpeed > 0) {
        this.xSpeed -= 0.05;
      } else if (this.xSpeed < 0) {
        this.xSpeed = 0;
      }
      
      if (this.ySpeed > 0) {
        this.ySpeed -= 0.05;
      } else if (this.ySpeed < 0) {
        this.ySpeed = 0;
      }
      
      this.x += this.xSpeed;
      this.y += this.ySpeed;
    }
  }

  brake() {
    // Apply braking force
    if (this.xSpeed > 0) {
      this.xSpeed -= 0.1;
    } else if (this.xSpeed < 0) {
      this.xSpeed += 0.1;
    }
    
    if (this.ySpeed > 0) {
      this.ySpeed -= 0.1;
    } else if (this.ySpeed < 0) {
      this.ySpeed += 0.1;
    }
    
    // Stop completely if the speed is low enough
    if (Math.abs(this.xSpeed) < 0.1) {
      this.xSpeed = 0;
    }
    if (Math.abs(this.ySpeed) < 0.1) {
      this.ySpeed = 0;
    }
  }

  turn(direction: number) {
    // Turning influence on x and y speed
    this.xSpeed += direction * 0.05;
    this.ySpeed += direction * 0.05;
    
    // Limit the turning influence
    this.xSpeed = this.p.constrain(this.xSpeed, -this.maxSpeed, this.maxSpeed);
    this.ySpeed = this.p.constrain(this.ySpeed, -this.maxSpeed, this.maxSpeed);
  }

  update() {
    this.checkCollisions();
    this.move();
  }

  checkCollisions() {
    const areaKey = `${this.worldX},${this.worldY}`;
    const obstacles = this.obstacles[areaKey] || [];
    
    for (let obs of obstacles) {
      // Check if the obstacle has a custom collision radius
      const collisionRadius = obs.collisionRadius || this.getDefaultCollisionRadius(obs);
      const dist = this.p.dist(this.x, this.y, obs.x, obs.y);
      
      // Use the proper collision radius
      if (dist < collisionRadius + this.size / 2) {
        // Handle collision
        const angle = this.p.atan2(this.y - obs.y, this.x - obs.x);
        this.x = obs.x + (collisionRadius + this.size / 2) * this.p.cos(angle);
        this.y = obs.y + (collisionRadius + this.size / 2) * this.p.sin(angle);
        
        // Stop movement and apply damage for solid obstacles
        if (obs.type !== 'fuelStain' && obs.type !== 'walkingMarks') {
          // Damage calculation based on speed
          const speed = Math.sqrt(this.xSpeed * this.xSpeed + this.ySpeed * this.ySpeed);
          if (speed > 1) {
            const damage = this.p.map(speed, 1, this.maxSpeed, 1, 5);
            this.health -= damage;
            
            // Emit damage effect (sound or visual would go here)
          }
          
          // Reduce speed in collision direction
          const dotProduct = this.xSpeed * this.p.cos(angle) + this.ySpeed * this.p.sin(angle);
          if (dotProduct > 0) {
            this.xSpeed -= dotProduct * this.p.cos(angle) * 1.5;
            this.ySpeed -= dotProduct * this.p.sin(angle) * 1.5;
          }
        }
      }
    }
  }

  getDefaultCollisionRadius(obstacle: any): number {
    // Default collision radius based on obstacle type
    switch(obstacle.type) {
      case 'rock':
        return obstacle.size * 10; // Base collision radius for rocks
      case 'cactus':
        return obstacle.size * 15; // Larger collision for cacti
      case 'bush':
        return obstacle.size * 8;
      case 'hut':
        return 35; // Default hut collision radius
      case 'fuelPump':
        return 20;
      default:
        return 10; // Default collision radius
    }
  }
}
