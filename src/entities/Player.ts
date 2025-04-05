import p5 from 'p5';

export default class Player {
  p: any;
  x: number;
  y: number;
  size: number;
  speed: number;
  xSpeed: number;
  ySpeed: number;
  worldX: number;
  worldY: number;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  inventory: any;
  riding: boolean;
  hoverbike: any;
  health: number;
  maxHealth: number;

  constructor(p: any, x: number, y: number, worldX: number, worldY: number, obstacles: Record<string, any[]>, resources: Record<string, any[]>, hoverbike: any, riding: boolean) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.size = 20;
    this.speed = 2;
    this.xSpeed = 0;
    this.ySpeed = 0;
    this.worldX = worldX;
    this.worldY = worldY;
    this.obstacles = obstacles;
    this.resources = resources;
    this.inventory = {
      metal: 0,
      copper: 0
    };
    this.riding = riding;
    this.hoverbike = hoverbike;
    this.health = 100;
    this.maxHealth = 100;
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  setRiding(riding: boolean) {
    this.riding = riding;
  }

  update() {
    if (this.riding) {
      this.x = this.hoverbike.x;
      this.y = this.hoverbike.y;
      this.worldX = this.hoverbike.worldX;
      this.worldY = this.hoverbike.worldY;
      return;
    }
    
    this.handleInput();
    this.x += this.xSpeed;
    this.y += this.ySpeed;
    this.xSpeed *= 0.7;
    this.ySpeed *= 0.7;
    this.checkCollisions();
    this.collectResources();
  }

  handleInput() {
    if (this.p.keyIsDown(this.p.LEFT_ARROW) || this.p.keyIsDown(65)) {
      this.xSpeed = -this.speed;
    }

    if (this.p.keyIsDown(this.p.RIGHT_ARROW) || this.p.keyIsDown(68)) {
      this.xSpeed = this.speed;
    }

    if (this.p.keyIsDown(this.p.UP_ARROW) || this.p.keyIsDown(87)) {
      this.ySpeed = -this.speed;
    }

    if (this.p.keyIsDown(this.p.DOWN_ARROW) || this.p.keyIsDown(83)) {
      this.ySpeed = this.speed;
    }
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
        // Handle collision with obstacle
        // Move player out of collision
        const angle = this.p.atan2(this.y - obs.y, this.x - obs.x);
        this.x = obs.x + (collisionRadius + this.size / 2) * this.p.cos(angle);
        this.y = obs.y + (collisionRadius + this.size / 2) * this.p.sin(angle);
        
        // Stop movement in collision direction
        const dotProduct = this.xSpeed * this.p.cos(angle) + this.ySpeed * this.p.sin(angle);
        if (dotProduct > 0) {
          this.xSpeed -= dotProduct * this.p.cos(angle);
          this.ySpeed -= dotProduct * this.p.sin(angle);
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

  collectResources() {
    const areaKey = `${this.worldX},${this.worldY}`;
    const resources = this.resources[areaKey] || [];
    
    for (let i = resources.length - 1; i >= 0; i--) {
      let res = resources[i];
      if (!res.collected && this.p.dist(this.x, this.y, res.x, res.y) < this.size) {
        if (res.type === 'metal') {
          this.inventory.metal++;
          res.collected = true;
          resources.splice(i, 1);
        } else if (res.type === 'copper') {
          this.inventory.copper++;
          res.collected = true;
          resources.splice(i, 1);
        }
      }
    }
  }

  display() {
    this.p.push();
    this.p.translate(this.x, this.y);
    this.p.fill(200);
    this.p.ellipse(0, 0, this.size, this.size);
    this.p.pop();
  }
}
