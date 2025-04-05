import p5 from 'p5';
import WorldGenerator from '../world/WorldGenerator';

export default class GameRenderer {
  p: any;
  worldGenerator: WorldGenerator;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  
  constructor(
    p: any, 
    worldGenerator: WorldGenerator, 
    player: any, 
    hoverbike: any,
    worldX: number,
    worldY: number,
    timeOfDay: number
  ) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
  }
  
  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }
  
  render() {
    this.p.background(20, 18, 24);
    
    // Calculate brightness based on time of day
    let brightness = 255;
    if (this.timeOfDay > 0.75 || this.timeOfDay < 0.25) {
      // Night time
      brightness = this.p.map(Math.sin(this.timeOfDay * Math.PI), 0, 1, 20, 100);
    } else {
      // Day time
      brightness = this.p.map(Math.sin(this.timeOfDay * Math.PI), 0, 1, 150, 255);
    }
    
    // Draw world tiles
    const areaSize = 3;
    for (let x = this.worldX - areaSize; x <= this.worldX + areaSize; x++) {
      for (let y = this.worldY - areaSize; y <= this.worldY + areaSize; y++) {
        // Use the correct method from WorldGenerator
        const zoneKey = `${x},${y}`;
        const sandTexture = this.worldGenerator.getSandTexture(zoneKey);
        const grassTexture = this.worldGenerator.getGrassTexture(zoneKey);
        
        if (sandTexture) {
          this.p.image(sandTexture, 0, 0);
        }
        
        if (grassTexture) {
          this.p.image(grassTexture, 0, 0);
        }
      }
    }
    
    // Draw obstacles
    const obstacles = this.worldGenerator.getObstacles();
    for (const areaKey in obstacles) {
      if (obstacles.hasOwnProperty(areaKey)) {
        const obsList = obstacles[areaKey];
        for (const obs of obsList) {
          if (obs.type === 'rock') {
            this.drawRock(obs);
          } else if (obs.type === 'metalDeposit') {
            this.drawMetalDeposit(obs);
          } else if (obs.type === 'copperDeposit') {
            this.drawCopperDeposit(obs);
          } else if (obs.type === 'windmill') {
            this.drawWindmill(obs);
          } else if (obs.type === 'fuelPump') {
            this.drawFuelPump(obs);
          } else if (obs.type === 'fuelStain') {
            this.drawFuelStain(obs);
          } else if (obs.type === 'walkingMarks') {
            this.drawWalkingMarks(obs);
          }
        }
      }
    }
    
    // Draw resources
    const resources = this.worldGenerator.getResources();
    for (const areaKey in resources) {
      if (resources.hasOwnProperty(areaKey)) {
        const resourceList = resources[areaKey];
        for (const resource of resourceList) {
          if (resource.type === 'cactus') {
            this.drawCactus(resource);
          }
        }
      }
    }
    
    // Draw hoverbike
    this.hoverbike.display();
    
    // Draw player
    this.player.display();
    
    // Draw day/night cycle indicator
    this.drawDayNightCycle();
  }
  
  drawDayNightCycle() {
    this.p.push();
    
    // Position the sun/moon icon
    this.p.translate(this.p.width - 50, 50);
    
    // Draw circle path
    this.p.noFill();
    this.p.stroke(150);
    this.p.ellipse(0, 0, 40, 40);
    
    // Calculate position of the icon
    const x = Math.cos(this.timeOfDay * this.p.TWO_PI) * 20;
    const y = Math.sin(this.timeOfDay * this.p.TWO_PI) * 20;
    
    // Draw sun or moon icon
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      // Draw sun
      this.p.fill(255, 200, 50);
      this.p.noStroke();
      this.p.ellipse(x, y, 20, 20);
    } else {
      // Draw moon
      this.p.fill(200);
      this.p.noStroke();
      this.p.ellipse(x, y, 20, 20);
    }
    
    this.p.pop();
  }
  
  drawRock(rock: any) {
    this.p.push();
    this.p.translate(rock.x, rock.y);
    this.p.rotate(rock.angle);
    
    // Rock body
    this.p.fill(100);
    this.p.noStroke();
    this.p.ellipse(0, 0, 16 * rock.size, 12 * rock.size);
    
    // Shadow
    this.p.fill(0, 0, 0, 30);
    this.p.ellipse(4 * rock.size, 4 * rock.size, 16 * rock.size, 12 * rock.size);
    
    this.p.pop();
  }
  
  drawMetalDeposit(deposit: any) {
    this.p.push();
    this.p.translate(deposit.x, deposit.y);
    this.p.rotate(deposit.angle);
    
    // Base
    this.p.fill(120);
    this.p.noStroke();
    this.p.ellipse(0, 0, 20 * deposit.size, 15 * deposit.size);
    
    // Metal veins
    this.p.fill(180);
    this.p.ellipse(-5 * deposit.size, -3 * deposit.size, 8 * deposit.size, 6 * deposit.size);
    this.p.ellipse(5 * deposit.size, 2 * deposit.size, 10 * deposit.size, 7 * deposit.size);
    
    // Shadow
    this.p.fill(0, 0, 0, 30);
    this.p.ellipse(4 * deposit.size, 4 * deposit.size, 20 * deposit.size, 15 * deposit.size);
    
    this.p.pop();
  }
  
  drawCopperDeposit(deposit: any) {
    this.p.push();
    this.p.translate(deposit.x, deposit.y);
    this.p.rotate(deposit.angle);
    
    // Base
    this.p.fill(150, 100, 80);
    this.p.noStroke();
    this.p.ellipse(0, 0, 20 * deposit.size, 15 * deposit.size);
    
    // Copper veins
    this.p.fill(200, 130, 100);
    this.p.ellipse(-5 * deposit.size, -3 * deposit.size, 8 * deposit.size, 6 * deposit.size);
    this.p.ellipse(5 * deposit.size, 2 * deposit.size, 10 * deposit.size, 7 * deposit.size);
    
    // Shadow
    this.p.fill(0, 0, 0, 30);
    this.p.ellipse(4 * deposit.size, 4 * deposit.size, 20 * deposit.size, 15 * deposit.size);
    
    this.p.pop();
  }
  
  drawCactus(cactus: any) {
    this.p.push();
    this.p.translate(cactus.x, cactus.y);
    
    // Main body
    this.p.fill(100, 150, 80);
    this.p.noStroke();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, -10 * cactus.size, 8 * cactus.size, 20 * cactus.size, 3);
    
    // Arms
    this.p.rect(-6 * cactus.size, -2 * cactus.size, 4 * cactus.size, 8 * cactus.size, 3);
    this.p.rect(6 * cactus.size, -2 * cactus.size, 4 * cactus.size, 8 * cactus.size, 3);
    
    // Shadow
    this.p.fill(0, 0, 0, 30);
    this.p.ellipse(3 * cactus.size, 10 * cactus.size, 8 * cactus.size, 5 * cactus.size);
    
    this.p.pop();
  }
  
  drawWindmill(windmill: any) {
    this.p.push();
    this.p.translate(windmill.x, windmill.y);
    
    // Pole
    this.p.fill(80);
    this.p.noStroke();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, 10, 4, 60);
    
    // Blades
    this.p.push();
    this.p.rotate(windmill.angle);
    this.p.fill(100);
    this.p.rect(0, 0, 4, 30);
    this.p.rotate(this.p.TWO_PI / 4);
    this.p.rect(0, 0, 4, 30);
    this.p.rotate(this.p.TWO_PI / 4);
    this.p.rect(0, 0, 4, 30);
    this.p.rotate(this.p.TWO_PI / 4);
    this.p.rect(0, 0, 4, 30);
    this.p.pop();
    
    this.p.pop();
  }
  
  drawFuelPump(pump: any) {
    this.p.push();
    this.p.translate(pump.x, pump.y);
    
    // Base
    this.p.fill(80);
    this.p.noStroke();
    this.p.rectMode(this.p.CENTER);
    this.p.rect(0, 12, 20 * pump.size, 4 * pump.size);
    
    // Main body
    this.p.fill(120);
    this.p.rect(0, -5 * pump.size, 8 * pump.size, 20 * pump.size);
    
    // Top
    this.p.fill(100);
    this.p.ellipse(0, -15 * pump.size, 16 * pump.size, 8 * pump.size);
    
    // Nozzle
    this.p.fill(50);
    this.p.rect(8 * pump.size, -2 * pump.size, 8 * pump.size, 2 * pump.size);
    
    this.p.pop();
  }

  drawFuelStain(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Darker, more subtle ground stain - fixed in place
    this.p.noStroke();
    
    // Multiple layers of translucent black/dark gray stains for depth
    const stainColors = [
      { color: this.p.color(0, 0, 0, 20),   size: 1.0 },  // Very transparent black base
      { color: this.p.color(20, 20, 20, 30), size: 0.9 }, // Slightly darker layer
      { color: this.p.color(10, 10, 10, 40), size: 0.8 }  // Darkest, smallest layer
    ];
    
    for (let stain of stainColors) {
      this.p.fill(stain.color);
      
      // Create irregular, organic-looking oil patches
      this.p.beginShape();
      const numPoints = 8;
      const baseSize = 16 * obs.size * stain.size;
      const baseWidth = baseSize;
      const baseHeight = baseSize * 0.75;
      
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * this.p.TWO_PI;
        const radiusX = baseWidth * (0.5 + this.p.noise(i * 0.3) * 0.5);
        const radiusY = baseHeight * (0.5 + this.p.noise(i * 0.5) * 0.5);
        const x = Math.cos(angle) * radiusX;
        const y = Math.sin(angle) * radiusY;
        this.p.vertex(x, y);
      }
      this.p.endShape(this.p.CLOSE);
    }
    
    this.p.pop();
  }

  drawWalkingMarks(mark: any) {
    this.p.push();
    this.p.translate(mark.x, mark.y);
    this.p.rotate(mark.angle);
    
    // Set color with opacity
    this.p.fill(100, 80, 60, mark.opacity); // Brownish color with specified opacity
    this.p.noStroke();
    
    // Draw a simple footprint shape
    this.p.beginShape();
    this.p.vertex(-5 * mark.size, -8 * mark.size);
    this.p.vertex(5 * mark.size, -8 * mark.size);
    this.p.vertex(8 * mark.size, 0);
    this.p.vertex(5 * mark.size, 8 * mark.size);
    this.p.vertex(-5 * mark.size, 8 * mark.size);
    this.p.vertex(-8 * mark.size, 0);
    this.p.endShape(this.p.CLOSE);
    
    this.p.pop();
  }
}
