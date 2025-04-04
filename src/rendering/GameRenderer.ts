
import WorldGenerator from "../world/WorldGenerator";
import Player from "../entities/Player";
import Hoverbike from "../entities/Hoverbike";

export default class GameRenderer {
  p: any;
  worldGenerator: WorldGenerator;
  player: Player;
  hoverbike: Hoverbike;
  worldX: number;
  worldY: number;
  timeOfDay: number;

  constructor(
    p: any,
    worldGenerator: WorldGenerator,
    player: Player,
    hoverbike: Hoverbike,
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

  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }

  render() {
    this.p.background(20, 18, 24);
    this.drawStars();
    this.drawHorizon();
    this.drawSunMoon();
    this.drawWindmill();
    this.drawGround();
    this.drawObstacles();
    this.drawResources();
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.display();
    }
    
    this.player.display();
  }

  drawBackgroundFuelStains() {
    // Draw more subtle and darker background fuel stains for the home base area
    this.p.noStroke();
    
    // Main stain under the fuel pump area (reduced size, darker black)
    this.p.fill(0, 0, 0, 15); // Very dark but transparent
    this.p.ellipse(this.p.width / 2 + 100, this.p.height / 2 - 40, 50, 35); // Smaller size
    
    // Darker center of the main stain (even darker)
    this.p.fill(0, 0, 0, 25); // Slightly more opaque
    this.p.ellipse(this.p.width / 2 + 100, this.p.height / 2 - 45, 30, 25); // Smaller size
    
    // Fewer additional smaller stains with lower opacities
    const stainPositions = [
      {x: this.p.width / 2 + 130, y: this.p.height / 2 - 30, size: 25, opacity: 10},
      {x: this.p.width / 2 + 85, y: this.p.height / 2 - 60, size: 20, opacity: 8}
    ];
    
    // Draw each additional stain
    for (const stain of stainPositions) {
      this.p.fill(0, 0, 0, stain.opacity); // Pure black with low opacity
      this.p.ellipse(stain.x, stain.y, stain.size, stain.size * 0.7);
    }
  }

  drawStars() {
    this.p.fill(255, 255, 255);
    for (let i = 0; i < 100; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height / 2);
      const size = this.p.random(1, 3);
      this.p.ellipse(x, y, size, size);
    }
  }

  drawHorizon() {
    let horizonColor = this.p.lerpColor(
      this.p.color(10, 10, 20),
      this.p.color(80, 60, 40),
      this.timeOfDay
    );
    this.p.background(horizonColor);
  }

  drawSunMoon() {
    this.p.push();

    // Calculate the angle based on the time of day
    let angle = this.p.map(this.timeOfDay, 0, 1, 0, 360);

    // Position the sun/moon
    let sunMoonX = this.p.width / 2 + this.p.cos(this.p.radians(angle)) * (this.p.width / 2);
    let sunMoonY = this.p.height / 2 + this.p.sin(this.p.radians(angle)) * (this.p.height / 3);

    // Draw sun/moon
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      // Draw sun
      this.p.fill(255, 204, 0);
      this.p.noStroke();
      this.p.ellipse(sunMoonX, sunMoonY, 50, 50);
    } else {
      // Draw moon
      this.p.fill(200);
      this.p.noStroke();
      this.p.ellipse(sunMoonX, sunMoonY, 40, 40);
    }

    this.p.pop();
  }

  drawWindmill() {
    this.p.push();
    this.p.translate(this.p.width * 0.15, this.p.height * 0.25);
    this.p.fill(150);
    this.p.stroke(100);
    this.p.strokeWeight(2);
    this.p.rect(-10, 0, 20, 100);

    this.p.push();
    this.p.rotate(this.worldGenerator.getWindmillAngle());
    this.p.fill(100);
    this.p.stroke(50);
    this.p.strokeWeight(3);
    this.p.rect(-5, -40, 10, 80);
    this.p.rect(-40, -5, 80, 10);
    this.p.pop();

    this.p.pop();
  }

  drawGround() {
    this.p.push();

    // Sand color that changes slightly with time of day
    let sandColor = this.p.lerpColor(
      this.p.color(194, 178, 128),
      this.p.color(150, 130, 80),
      this.timeOfDay
    );
    this.p.background(sandColor);

    // Draw faint sand lines
    this.p.stroke(184, 168, 118, 50);
    this.p.strokeWeight(1);
    for (let i = 0; i < this.p.width; i += 20) {
      let offset = this.p.sin(i * 0.05 + this.timeOfDay * this.p.TWO_PI) * 10;
      this.p.line(i, this.p.height / 2 + offset, i, this.p.height);
    }

    this.p.pop();
  }

  drawObstacles() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];

    for (let obs of currentObstacles) {
      if (obs.type === 'rock') {
        this.drawRock(obs);
      } else if (obs.type === 'bush') {
        this.drawBush(obs);
      } else if (obs.type === 'cactus') {
        this.drawCactus(obs);
      } else if (obs.type === 'hut') {
        this.drawHut(obs);
      } else if (obs.type === 'fuelPump') {
        this.drawFuelPump(obs);
      } else if (obs.type === 'walkingMarks') {
        this.drawWalkingMarks(obs);
      } else if (obs.type === 'fuelStain') {
        this.drawFuelStain(obs);
      }
    }
  }

  drawRock(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(50, 40, 30, 80);
    let shadowOffsetX = 5 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Main rock shape
    this.p.fill(80, 70, 60);
    this.p.stroke(50, 40, 30); // Added outline
    this.p.strokeWeight(0.5);  // Thin outline
    
    if (obs.shape && Array.isArray(obs.shape)) {
      this.p.beginShape();
      for (let point of obs.shape) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      // Inner shapes (no stroke)
      this.p.noStroke();
      this.p.fill(100, 90, 80);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = 2 * obs.size;
        let offsetY = 2 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(120, 110, 100);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = -2 * obs.size;
        let offsetY = -2 * obs.size;
        this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);
    } else {
      // Fallback if shape is missing
      this.p.ellipse(0, 0, 20 * obs.size, 15 * obs.size);
    }

    // Details
    this.p.fill(60, 50, 40);
    this.p.ellipse(-4 * obs.size, -2 * obs.size, 3 * obs.size, 1 * obs.size);
    this.p.ellipse(2 * obs.size, 3 * obs.size, 1 * obs.size, 3 * obs.size);
    this.p.fill(130, 120, 110);
    this.p.ellipse(-2 * obs.size, 4 * obs.size, 2 * obs.size, 2 * obs.size);
    this.p.ellipse(3 * obs.size, -3 * obs.size, 2 * obs.size, 2 * obs.size);
    this.p.ellipse(-5 * obs.size, 0 * obs.size, 1 * obs.size, 1 * obs.size);
    this.p.ellipse(0 * obs.size, 5 * obs.size, 1 * obs.size, 1 * obs.size);

    this.p.pop();
  }

  drawBush(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(180, 150, 100, 50);
    let shadowOffsetX = 2 * obs.size;
    let shadowOffsetY = 2 * obs.size;
    let shadowWidth = 10 * obs.size;
    let shadowHeight = 10 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Main bush shape with outline
    this.p.fill(50, 70, 30);
    this.p.stroke(30, 50, 20); // Added outline
    this.p.strokeWeight(0.6);  // Medium outline
    
    if (obs.shape && Array.isArray(obs.shape)) {
      this.p.beginShape();
      for (let point of obs.shape) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      // Inner shapes
      this.p.noStroke();
      this.p.fill(70, 90, 50);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = 1 * obs.size;
        let offsetY = 1 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(90, 110, 70);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = -1 * obs.size;
        let offsetY = -1 * obs.size;
        this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);
    } else {
      // Fallback if shape is missing
      this.p.ellipse(0, 0, 15 * obs.size, 12 * obs.size);
    }

    // Details
    this.p.fill(60, 80, 40);
    this.p.ellipse(-3 * obs.size, -1 * obs.size, 2 * obs.size, 2 * obs.size);
    this.p.ellipse(2 * obs.size, 2 * obs.size, 3 * obs.size, 1 * obs.size);
    this.p.fill(80, 100, 60);
    this.p.ellipse(1 * obs.size, -2 * obs.size, 1 * obs.size, 3 * obs.size);
    this.p.ellipse(-2 * obs.size, 1 * obs.size, 3 * obs.size, 1 * obs.size);

    this.p.pop();
  }

  drawCactus(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(30, 40, 30, 50);
    let shadowOffsetX = 3 * obs.size;
    let shadowOffsetY = 3 * obs.size;
    let shadowWidth = 12 * obs.size;
    let shadowHeight = 8 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Main cactus shape with outline
    this.p.fill(40, 60, 40);
    this.p.stroke(20, 40, 20); // Added outline
    this.p.strokeWeight(0.7);  // Medium outline
    
    if (obs.shape && Array.isArray(obs.shape)) {
      // Draw body first
      const bodyPart = obs.shape.find((part: any) => part.type === 'body');
      if (bodyPart && bodyPart.points) {
        this.p.beginShape();
        for (let point of bodyPart.points) {
          this.p.vertex(point.x, point.y);
        }
        this.p.endShape(this.p.CLOSE);
      } else {
        // Fallback if body shape is missing
        this.p.rect(-3 * obs.size, -25 * obs.size, 6 * obs.size, 25 * obs.size, 1);
      }

      // Draw arms
      for (let part of obs.shape) {
        if (part.type === 'arm' && part.points) {
          this.p.beginShape();
          for (let point of part.points) {
            this.p.vertex(point.x, point.y);
          }
          this.p.endShape(this.p.CLOSE);
        }
      }
    } else {
      // Fallback if shape is missing
      this.p.rect(-3 * obs.size, -25 * obs.size, 6 * obs.size, 25 * obs.size, 1);
    }

    // Details (spikes)
    this.p.stroke(20, 40, 20); // Added outline for spikes
    this.p.strokeWeight(1);    // Slightly thicker outline
    let spikeCount = 5;
    for (let i = 0; i < spikeCount; i++) {
      let angle = this.p.TWO_PI / spikeCount * i;
      let spikeX = this.p.cos(angle) * 8 * obs.size;
      let spikeY = this.p.sin(angle) * 8 * obs.size;
      this.p.line(0, 0, spikeX, spikeY);
    }
    this.p.noStroke();

    this.p.pop();
  }

  drawHut(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(50, 40, 30, 70);
    let shadowOffsetX = 4 * obs.size;
    let shadowOffsetY = 4 * obs.size;
    let shadowWidth = 30 * obs.size;
    let shadowHeight = 15 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Check if obs.shape exists, is an array, and has elements
    if (obs.shape && Array.isArray(obs.shape) && obs.shape.length > 0) {
      // Main hut shape with outline
      this.p.fill(120, 100, 80);
      this.p.stroke(80, 60, 40); // Added outline
      this.p.strokeWeight(0.8);  // Medium outline
      this.p.beginShape();
      for (let point of obs.shape) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      // Inner shapes
      this.p.noStroke();
      this.p.fill(140, 120, 100);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = 1 * obs.size;
        let offsetY = 1 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(160, 140, 120);
      this.p.beginShape();
      for (let point of obs.shape) {
        let offsetX = -1 * obs.size;
        let offsetY = -1 * obs.size;
        this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);
    } else {
      // Default size if not specified
      const size = obs.size || 1;
      
      // Main hut body
      this.p.fill(120, 100, 80);
      this.p.stroke(80, 60, 40);
      this.p.strokeWeight(0.8);
      this.p.rect(-15 * size, -5 * size, 30 * size, 20 * size, 2 * size);
      
      // Hut roof
      this.p.fill(100, 80, 60);
      this.p.triangle(
        -18 * size, -5 * size,
        18 * size, -5 * size,
        0, -15 * size
      );
      
      // Door
      this.p.fill(80, 60, 40);
      this.p.rect(-5 * size, 5 * size, 10 * size, 10 * size);
      
      // Window
      this.p.fill(160, 140, 100);
      this.p.rect(8 * size, -2 * size, 5 * size, 5 * size);
    }

    // Details (door)
    this.p.fill(80, 60, 40);
    this.p.stroke(50, 30, 10); // Added outline for door
    this.p.strokeWeight(1);    // Slightly thicker outline
    const size = obs.size || 1;
    this.p.rect(-8 * size, 6 * size, 16 * size, 8 * size);
    this.p.noStroke();

    this.p.pop();
  }

  drawFuelPump(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Shadow
    this.p.fill(50, 40, 30, 70);
    let shadowOffsetX = 3 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 15 * obs.size;
    let shadowHeight = 8 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Main fuel pump shape with outline
    this.p.fill(100, 100, 100);
    this.p.stroke(60, 60, 60); // Added outline
    this.p.strokeWeight(0.9);  // Medium outline
    this.p.rect(-6 * obs.size, -10 * obs.size, 12 * obs.size, 20 * obs.size, 2 * obs.size);

    // Inner details
    this.p.noStroke();
    this.p.fill(120, 120, 120);
    this.p.rect(-4 * obs.size, -8 * obs.size, 8 * obs.size, 16 * obs.size, 2 * obs.size);

    this.p.fill(80, 80, 80);
    this.p.ellipse(0, -6 * obs.size, 6 * obs.size, 6 * obs.size);

    // Nozzle and hose
    this.p.fill(50, 50, 50);
    this.p.stroke(30, 30, 30); // Added outline for nozzle
    this.p.strokeWeight(1);    // Slightly thicker outline
    this.p.rect(6 * obs.size, 2 * obs.size, 2 * obs.size, 6 * obs.size);
    this.p.noStroke();

    this.p.pop();
  }

  drawWalkingMarks(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    this.p.rotate(obs.angle);
    
    // Draw subtle walking marks/footprints
    const opacity = obs.opacity || 100;
    
    // Add very subtle outline to footprints
    this.p.stroke(160, 140, 100, opacity * 0.5);
    this.p.strokeWeight(0.3);
    
    this.p.fill(190, 170, 140, opacity);
    
    // Draw a series of footprints
    const spacing = 10;
    const size = obs.size || 1;
    
    for (let i = 0; i < 5; i++) {
      const xOffset = i * spacing * 2;
      
      // Left foot
      this.p.ellipse(xOffset, -3, 4 * size, 7 * size);
      
      // Right foot
      this.p.ellipse(xOffset + spacing, 3, 4 * size, 7 * size);
    }
    
    this.p.pop();
  }
  
  drawFuelStain(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Darker, more subtle ground stain - fixed in place
    this.p.noStroke();
    this.p.fill(20, 20, 20, 40); // Even more subtle opacity
    
    // Main oil puddle
    this.p.ellipse(0, 0, 16 * obs.size, 12 * obs.size);
    
    // Create several irregular oil patches with fixed shape
    // Use deterministic positions based on seedAngle
    const numPatches = 5;
    for (let i = 0; i < numPatches; i++) {
      // Create fixed positions based on obs.seedAngle
      const angle = obs.seedAngle + i * (Math.PI * 2 / numPatches);
      const distance = 5 + i * 2.5; // Fixed pattern
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      // Size variation based on position
      const size = 3 + ((i * 29) % 5) * obs.size;
      
      // Slightly different shades of black for variation
      const alpha = 30 + (i * 5);
      this.p.fill(15, 15, 15, alpha);
      
      // Add subtle outline to stains
      this.p.stroke(10, 10, 10, alpha * 0.6);
      this.p.strokeWeight(0.3);
      this.p.ellipse(x, y, size, size * 0.8);
      this.p.noStroke();
    }
    
    this.p.pop();
  }
  
  drawResources() {
    let currentResources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    
    for (let res of currentResources) {
      if (res.type === 'metal') {
        this.drawMetalScrap(res);
      } else if (res.type === 'copper') {
        this.drawCopperOre(res);
      }
    }
  }
  
  drawMetalScrap(res: any) {
    this.p.push();
    this.p.translate(res.x, res.y);
    
    // Shadow
    this.p.fill(40, 40, 40, 70);
    this.p.ellipse(2, 2, 15, 8);
    
    // Metal scrap with outline
    this.p.fill(180, 180, 180);
    this.p.stroke(100, 100, 100);
    this.p.strokeWeight(0.7);
    
    // Draw random jagged metal shape
    if (res.points && Array.isArray(res.points)) {
      this.p.beginShape();
      for (let i = 0; i < res.points.length; i++) {
        this.p.vertex(res.points[i].x, res.points[i].y);
      }
      this.p.endShape(this.p.CLOSE);
      
      // Highlights on metal
      this.p.noStroke();
      this.p.fill(220, 220, 220);
      
      // Draw small highlights
      for (let i = 0; i < 3; i++) {
        let idx = i % res.points.length;
        let x = res.points[idx].x * 0.3;
        let y = res.points[idx].y * 0.3;
        this.p.ellipse(x, y, 2, 2);
      }
    } else {
      // Fallback shape if points are missing
      this.p.beginShape();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * this.p.TWO_PI;
        const radius = 5 + Math.random() * 3;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        this.p.vertex(x, y);
      }
      this.p.endShape(this.p.CLOSE);
      
      // Add highlights
      this.p.noStroke();
      this.p.fill(220, 220, 220);
      this.p.ellipse(-1, -1, 2, 2);
      this.p.ellipse(2, 1, 1.5, 1.5);
    }
    
    this.p.pop();
  }
  
  drawCopperOre(res: any) {
    this.p.push();
    this.p.translate(res.x, res.y);
    
    // Shadow
    this.p.fill(40, 30, 20, 70);
    this.p.ellipse(3, 3, 18, 10);
    
    // Main rock part with outline
    this.p.fill(90, 70, 50);
    this.p.stroke(70, 50, 30);
    this.p.strokeWeight(0.8);
    
    // Draw rock shape
    if (res.shape && Array.isArray(res.shape)) {
      this.p.beginShape();
      for (let i = 0; i < res.shape.length; i++) {
        this.p.vertex(res.shape[i].x, res.shape[i].y);
      }
      this.p.endShape(this.p.CLOSE);
      
      // Copper veins with outline
      this.p.fill(200, 120, 40);
      this.p.stroke(160, 100, 30);
      this.p.strokeWeight(0.5);
      
      // Generate copper veins if they don't exist
      if (!res.copperPoints) {
        res.copperPoints = [];
        const veinCount = 3;
        for (let i = 0; i < veinCount; i++) {
          const veinPoints = [];
          const startAngle = Math.random() * this.p.TWO_PI;
          const veinLength = 3 + Math.random() * 2;
          for (let j = 0; j < veinLength; j++) {
            veinPoints.push({
              x: Math.cos(startAngle) * j * 2,
              y: Math.sin(startAngle) * j * 2
            });
          }
          res.copperPoints.push(veinPoints);
        }
      }
      
      // Draw copper veins
      for (let i = 0; i < res.copperPoints.length; i++) {
        let vein = res.copperPoints[i];
        this.p.beginShape();
        for (let j = 0; j < vein.length; j++) {
          this.p.vertex(vein[j].x, vein[j].y);
        }
        this.p.endShape(this.p.CLOSE);
      }
      
      // Copper highlights
      this.p.noStroke();
      this.p.fill(240, 160, 60, 200);
      
      // Draw highlights
      for (let i = 0; i < res.copperPoints.length; i++) {
        let vein = res.copperPoints[i];
        if (vein.length > 0) {
          let centerIdx = Math.floor(vein.length / 2);
          this.p.ellipse(vein[centerIdx].x, vein[centerIdx].y, 2, 2);
        }
      }
    } else {
      // Fallback if shape is missing
      this.p.ellipse(0, 0, 12, 10);
      
      // Add simple copper veins
      this.p.fill(200, 120, 40);
      this.p.noStroke();
      this.p.ellipse(-2, -1, 4, 3);
      this.p.ellipse(3, 2, 3, 2);
      
      // Add highlights
      this.p.fill(240, 160, 60);
      this.p.ellipse(-2, -1, 1, 1);
      this.p.ellipse(3, 2, 1, 1);
    }
    
    this.p.pop();
  }
}
