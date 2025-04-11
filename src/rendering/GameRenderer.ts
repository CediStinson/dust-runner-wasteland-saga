import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import Grandpa from '../entities/Grandpa';
import WorldGenerator from '../world/WorldGenerator';

export default class GameRenderer {
  p: any;
  worldGenerator: WorldGenerator;
  player: Player;
  hoverbike: Hoverbike;
  grandpa: Grandpa | null;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  screenShakeIntensity: number;
  screenShakeDuration: number;
  
  constructor(p: any, worldGenerator: WorldGenerator, player: Player, hoverbike: Hoverbike, worldX: number, worldY: number, timeOfDay: number, grandpa: Grandpa | null = null) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.grandpa = grandpa;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
    this.screenShakeIntensity = 0;
    this.screenShakeDuration = 0;
  }
  
  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }
  
  startScreenShake(intensity: number, duration: number) {
    this.screenShakeIntensity = intensity;
    this.screenShakeDuration = duration;
  }
  
  render() {
    // Apply screen shake effect
    let offsetX = 0;
    let offsetY = 0;
    
    if (this.screenShakeDuration > 0) {
      offsetX = (Math.random() * 2 - 1) * this.screenShakeIntensity * this.screenShakeDuration;
      offsetY = (Math.random() * 2 - 1) * this.screenShakeIntensity * this.screenShakeDuration;
      this.screenShakeDuration--;
    }
    
    this.p.push();
    this.p.translate(offsetX, offsetY);
    
    // Clear the screen
    this.p.background(200, 180, 150);
    
    // Set the background color based on time of day
    this.setBackgroundColor();
    
    // Render the world
    this.renderWorld();
    
    // Render the grandpa if we're at the home base
    if (this.grandpa && this.worldX === 0 && this.worldY === 0) {
      this.grandpa.render();
    }
    
    // Render the hoverbike
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.render();
    }
    
    // Render the player
    this.player.render();
    
    this.p.pop();
  }
  
  setBackgroundColor() {
    // Calculate background color based on time of day
    let baseColor;
    
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      // Day: Light blue sky
      baseColor = this.p.color(135, 206, 235);
    } else {
      // Night: Dark blue
      baseColor = this.p.color(20, 30, 60);
    }
    
    this.p.background(baseColor);
  }
  
  renderWorld() {
    // Get the obstacles and resources for the current world coordinates
    const obstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    const resources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    
    // Sort the obstacles and resources by their zIndex
    const allObjects = [...obstacles, ...resources].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
    
    // Render each obstacle
    for (const obstacle of allObjects) {
      this.renderObstacle(obstacle);
    }
  }
  
  renderObstacle(obstacle: any) {
    switch (obstacle.type) {
      case 'cactus':
        this.drawCactus(obstacle);
        break;
      case 'rock':
        this.drawRock(obstacle);
        break;
      case 'smallRock':
        this.drawSmallRock(obstacle);
        break;
      case 'metalNode':
        this.drawMetalNode(obstacle);
        break;
      case 'copperNode':
        this.drawCopperNode(obstacle);
        break;
      case 'fuelCanister':
        this.drawFuelCanister(obstacle);
        break;
      case 'fuelPump':
        this.drawFuelPump(obstacle);
        break;
      case 'fuelStain':
        this.drawFuelStain(obstacle);
        break;
      case 'windmill':
        this.drawWindmill(obstacle);
        break;
      case 'house':
        this.drawHouse(obstacle);
        break;
      case 'hut':
        this.drawHut(obstacle);
        break;
      case 'tarp':
        this.drawTarp(obstacle);
        break;
      case 'walkingMarks':
        this.drawWalkingMarks(obstacle);
        break;
      case 'explosion':
        this.drawExplosion(obstacle);
        break;
      case 'smoke':
        this.drawSmoke(obstacle);
        break;
      case 'floatingText':
        this.drawFloatingText(obstacle);
        break;
      default:
        this.drawGenericObstacle(obstacle);
        break;
    }
  }
  
  drawCactus(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Main body
    this.p.fill(50, 100, 50);
    this.p.stroke(30, 70, 30);
    this.p.ellipse(0, 0, obstacle.width || 20, obstacle.height || 30);
    
    // Spikes
    this.p.stroke(20);
    for (let i = 0; i < 5; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const x = this.p.cos(angle) * (obstacle.width || 20) / 2;
      const y = this.p.sin(angle) * (obstacle.height || 30) / 2;
      this.p.point(x, y);
    }
    
    this.p.pop();
  }
  
  drawRock(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Rock shape
    this.p.fill(100);
    this.p.stroke(80);
    this.p.ellipse(0, 0, obstacle.size * 17 || 20, obstacle.size * 14 || 15);
    
    this.p.pop();
  }
  
  drawSmallRock(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Small rock shape
    this.p.fill(90);
    this.p.stroke(70);
    this.p.ellipse(0, 0, obstacle.size * 12 || 12, obstacle.size * 10 || 10);
    
    this.p.pop();
  }
  
  drawMetalNode(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Metal node shape
    this.p.fill(130);
    this.p.stroke(110);
    this.p.ellipse(0, 0, obstacle.size * 16 || 18, obstacle.size * 14 || 16);
    
    this.p.pop();
  }
  
  drawCopperNode(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Copper node shape
    this.p.fill(184, 115, 51);
    this.p.stroke(150, 90, 40);
    this.p.ellipse(0, 0, obstacle.size * 16 || 18, obstacle.size * 14 || 16);
    
    this.p.pop();
  }
  
  drawFuelCanister(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Canister body
    this.p.fill(200, 200, 50);
    this.p.stroke(150, 150, 30);
    this.p.rect(-8, -15, 16, 30, 3);
    
    // Top cap
    this.p.fill(80);
    this.p.rect(-8, -15, 16, 5);
    
    this.p.pop();
  }
  
  drawFuelPump(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Base
    this.p.fill(80);
    this.p.rect(-10, 0, 20, 5);
    
    // Main body
    this.p.fill(150);
    this.p.rect(-5, -25, 10, 25);
    
    // Top
    this.p.fill(50);
    this.p.ellipse(0, -25, 20, 10);
    
    // Nozzle
    this.p.fill(50);
    this.p.rect(5, -15, 10, 5);
    
    this.p.pop();
  }
  
  drawFuelStain(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Set random seed for each stain
    this.p.randomSeed(obstacle.x * 1000 + obstacle.y);
    
    // Draw multiple blobs for the stain
    this.p.noStroke();
    this.p.fill(30, 50, 30, 100); // Dark, translucent color
    
    const numBlobs = 5;
    for (let i = 0; i < numBlobs; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const distance = this.p.random(5, 10) * obstacle.size;
      const x = this.p.cos(angle) * distance;
      const y = this.p.sin(angle) * distance;
      const size = this.p.random(5, 8) * obstacle.size;
      this.p.ellipse(x, y, size, size);
    }
    
    this.p.pop();
  }
  
  drawWindmill(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Pole
    this.p.fill(100, 80, 50);
    this.p.rect(-3, -50, 6, 50);
    
    // Blades
    this.p.rotate(this.worldGenerator.windmillAngle);
    this.p.fill(180);
    this.p.stroke(150);
    
    const bladeLength = 30;
    const bladeWidth = 5;
    
    for (let i = 0; i < 3; i++) {
      this.p.push();
      this.p.rotate(this.p.TWO_PI / 3 * i);
      this.p.rect(-bladeWidth / 2, 0, bladeWidth, bladeLength);
      this.p.pop();
    }
    
    this.p.pop();
  }
  
  drawHouse(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Base
    this.p.fill(120);
    this.p.rect(-obstacle.width / 2, -obstacle.height, obstacle.width, obstacle.height);
    
    // Roof
    this.p.fill(80);
    this.p.triangle(
      -obstacle.width / 2, -obstacle.height,
      obstacle.width / 2, -obstacle.height,
      0, -obstacle.height - 20
    );
    
    this.p.pop();
  }
  
  drawHut(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Base
    this.p.fill(140, 100, 60);
    this.p.ellipse(0, -obstacle.height / 4, obstacle.width, obstacle.height / 2);
    
    // Roof
    this.p.fill(100, 70, 40);
    this.p.arc(0, -obstacle.height / 2, obstacle.width, obstacle.height / 2, this.p.PI, 0);
    
    this.p.pop();
  }
  
  drawTarp(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Tarp color
    this.p.fill(obstacle.color.r, obstacle.color.g, obstacle.color.b, 200);
    this.p.noStroke();
    
    // Tarp shape
    this.p.beginShape();
    this.p.vertex(-obstacle.width / 2, -obstacle.height / 2);
    this.p.vertex(obstacle.width / 2, -obstacle.height / 2);
    this.p.vertex(obstacle.width / 2 + 5, obstacle.height / 2);
    this.p.vertex(-obstacle.width / 2 - 5, obstacle.height / 2);
    this.p.endShape(this.p.CLOSE);
    
    this.p.pop();
  }
  
  drawWalkingMarks(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    this.p.rotate(obstacle.angle);
    
    // Footprint color
    this.p.fill(100, 80, 60, obstacle.opacity);
    this.p.noStroke();
    
    // Left footprint
    this.p.beginShape();
    this.p.ellipse(-5 * obstacle.size, 0, 6 * obstacle.size, 10 * obstacle.size);
    this.p.endShape();
    
    // Right footprint
    this.p.beginShape();
    this.p.ellipse(5 * obstacle.size, 0, 6 * obstacle.size, 10 * obstacle.size);
    this.p.endShape();
    
    this.p.pop();
  }
  
  drawExplosion(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Calculate frame based on age
    const frame = obstacle.frame;
    
    // Draw explosion sprite
    if (frame < obstacle.maxFrames) {
      this.p.noStroke();
      this.p.fill(255, 200, 0, 255 - (frame / obstacle.maxFrames) * 255);
      this.p.ellipse(0, 0, 20 * obstacle.size * (frame / obstacle.maxFrames), 20 * obstacle.size * (frame / obstacle.maxFrames));
      obstacle.frame++;
    }
    
    this.p.pop();
  }
  
  drawSmoke(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Calculate frame based on age
    const frame = obstacle.frame;
    
    // Draw smoke sprite
    if (frame < obstacle.maxFrames) {
      this.p.noStroke();
      this.p.fill(100, 100, 100, obstacle.alpha * (1 - (frame / obstacle.maxFrames)));
      this.p.ellipse(0, 0, 15 * obstacle.size * (frame / obstacle.maxFrames), 15 * obstacle.size * (frame / obstacle.maxFrames));
      obstacle.frame++;
    }
    
    this.p.pop();
  }
  
  drawFloatingText(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Calculate text fade-out
    const opacity = this.p.map(obstacle.lifetime - obstacle.age, 0, obstacle.lifetime, 0, 255);
    
    // Draw text
    this.p.fill(obstacle.color.r, obstacle.color.g, obstacle.color.b, opacity);
    this.p.textSize(16);
    this.p.textAlign(this.p.CENTER, this.p.BOTTOM);
    this.p.text(obstacle.text, 0, 0);
    
    this.p.pop();
    
    // Increment age
    obstacle.age++;
  }
  
  drawGenericObstacle(obstacle: any) {
    this.p.push();
    this.p.translate(obstacle.x, obstacle.y);
    
    // Generic obstacle shape
    this.p.fill(150);
    this.p.stroke(120);
    this.p.rect(-10, -10, 20, 20);
    
    this.p.pop();
  }
}
