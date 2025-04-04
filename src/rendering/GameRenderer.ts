
import p5 from 'p5';

export default class GameRenderer {
  p: any;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;

  constructor(p: any, worldGenerator: any, player: any, hoverbike: any, worldX: number, worldY: number, timeOfDay: number = 0.25) {
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
    this.drawBackground();
    this.applyDaytimeTint();
    this.drawObstaclesBackLayer();
    this.drawResources();
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.display();
    }
    
    this.player.display();
    
    // Draw foreground elements (like tarps) after player
    this.drawObstaclesForegroundLayer();
  }

  drawBackground() {
    let zoneKey = `${this.worldX},${this.worldY}`;
    if (this.worldGenerator.getSandTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getSandTexture(zoneKey), 0, 0);
    }
    if (this.worldGenerator.getGrassTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getGrassTexture(zoneKey), 0, 0);
    }
    
    // Draw sand dunes
    this.drawSandDunes();
  }
  
  drawSandDunes() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'sandDune') {
        this.p.push();
        this.p.translate(obs.x, obs.y);
        this.p.rotate(obs.angle);
        
        // Draw subtle, curved sand dune streak
        this.p.noStroke();
        this.p.fill(245, 240, 230, 50); // Very light beige, nearly white, semi-transparent
        
        // Draw curved sand dune with multiple layers for depth
        for (let i = 0; i < 3; i++) {
          const opacity = 30 - i * 10; // Decrease opacity for each layer
          const widthMultiplier = 0.8 - i * 0.2; // Decrease width for each layer
          
          this.p.fill(245, 240, 230, opacity);
          
          this.p.beginShape();
          // Curved top edge of dune
          for (let x = -obs.length/2; x <= obs.length/2; x += 10) {
            // Create sine wave pattern for natural curve
            const waveHeight = Math.sin((x / obs.length) * Math.PI) * obs.width * widthMultiplier;
            const noise = this.p.noise(x * 0.01, i * 10) * obs.width * 0.3;
            this.p.vertex(x, -waveHeight - noise);
          }
          
          // Straighter bottom edge
          for (let x = obs.length/2; x >= -obs.length/2; x -= 10) {
            const minorWave = Math.sin((x / obs.length) * Math.PI * 2) * obs.width * 0.2 * widthMultiplier;
            this.p.vertex(x, minorWave);
          }
          this.p.endShape(this.p.CLOSE);
        }
        
        this.p.pop();
      }
    }
  }
  
  drawObstaclesBackLayer() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      // Draw everything except the tarp which goes in foreground
      if (obs.type !== 'tarp') {
        if (obs.type === 'rock') {
          this.drawRock(obs);
        } else if (obs.type === 'hut') {
          this.drawHut(obs);
        } else if (obs.type === 'bush') {
          this.drawBush(obs);
        } else if (obs.type === 'cactus') {
          this.drawCactus(obs);
        } else if (obs.type === 'fuelPump') {
          this.drawFuelPump(obs);
        } else if (obs.type === 'fuelStain') {
          // Only draw fuel stains in home area
          if (this.worldX === 0 && this.worldY === 0) {
            this.drawFuelStain(obs);
          }
        } else if (obs.type === 'walkingMarks') {
          // Only draw walking marks in home area
          if (this.worldX === 0 && this.worldY === 0) {
            this.drawWalkingMarks(obs);
          }
        }
      }
    }
  }
  
  drawObstaclesForegroundLayer() {
    // Only draw foreground elements like tarps
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    for (let obs of currentObstacles) {
      if (obs.type === 'tarp') {
        this.drawTarp(obs);
      }
    }
  }
  
  drawTarp(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    this.p.rotate(obs.angle);
    
    // Shadow under tarp
    this.p.fill(30, 20, 10, 70);
    this.p.ellipse(5, 5, 60, 30);
    
    // Draw the support poles first
    this.p.fill(120, 90, 60);
    this.p.rect(-25, -15, 3, 30);
    this.p.rect(25, -15, 3, 30);
    
    // Draw the tarp
    this.p.fill(140, 100, 60); // Brown tarp color
    
    // Main tarp sheet - slightly curved
    this.p.beginShape();
    this.p.vertex(-30, -15);
    this.p.vertex(30, -15);
    this.p.vertex(35, -5);
    this.p.vertex(30, 5);
    this.p.vertex(-30, 5);
    this.p.vertex(-35, -5);
    this.p.endShape(this.p.CLOSE);
    
    // Rope lines
    this.p.stroke(170, 150, 120);
    this.p.strokeWeight(1);
    // Left side ropes
    this.p.line(-25, -15, -40, 10);
    this.p.line(-15, -15, -30, 15);
    // Right side ropes
    this.p.line(25, -15, 40, 10);
    this.p.line(15, -15, 30, 15);
    
    // Shadows and highlights on tarp for depth
    this.p.noStroke();
    this.p.fill(160, 120, 70, 100); // Lighter highlight
    this.p.quad(-25, -15, 25, -15, 20, -10, -20, -10);
    
    this.p.fill(100, 70, 40, 100); // Darker shadow
    this.p.quad(-30, 0, 30, 0, 20, 5, -20, 5);
    
    // Tarp wrinkles/folds
    this.p.stroke(120, 90, 50);
    this.p.strokeWeight(0.5);
    for (let i = -25; i < 25; i += 10) {
      this.p.line(i, -15, i + 3, 5);
    }
    
    this.p.pop();
  }
  
  applyDaytimeTint() {
    // Apply color tint based on time of day
    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 1 = midnight
    
    // Clear any previous tint
    this.p.noTint();
    
    if (this.timeOfDay < 0.25) {
      // Midnight to sunrise: blue night tint getting lighter
      const blendFactor = this.timeOfDay / 0.25; // 0 to 1
      const r = this.p.lerp(50, 150, blendFactor);
      const g = this.p.lerp(50, 120, blendFactor);
      const b = this.p.lerp(80, 100, blendFactor);
      const alpha = this.p.lerp(180, 30, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.5) {
      // Sunrise to noon: orangey sunrise to clear day
      const blendFactor = (this.timeOfDay - 0.25) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(200, 255, blendFactor);
      const b = this.p.lerp(150, 255, blendFactor);
      const alpha = this.p.lerp(40, 0, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.75) {
      // Noon to sunset: clear day to orangey sunset
      const blendFactor = (this.timeOfDay - 0.5) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(255, 150, blendFactor);
      const b = this.p.lerp(255, 100, blendFactor);
      const alpha = this.p.lerp(0, 50, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else {
      // Sunset to midnight: orangey sunset to blue night
      const blendFactor = (this.timeOfDay - 0.75) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 50, blendFactor);
      const g = this.p.lerp(150, 50, blendFactor);
      const b = this.p.lerp(100, 80, blendFactor);
      const alpha = this.p.lerp(50, 180, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
  }

  drawWalkingMarks(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    this.p.rotate(obs.angle);
    
    // Draw subtle walking marks/footprints
    this.p.noStroke();
    const opacity = obs.opacity || 100;
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

  drawRock(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Draw more subtle shadow with gradient fade
    this.p.fill(50, 40, 30, 50); // More transparent shadow
    let shadowOffsetX = 5 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
    
    // Draw gradient shadow (multiple overlapping ellipses with decreasing opacity)
    for (let i = 0; i < 3; i++) {
      const scale = 1 - i * 0.2;
      const alpha = 60 - i * 20;
      this.p.fill(50, 40, 30, alpha);
      this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth * scale, shadowHeight * scale);
    }

    this.p.fill(80, 70, 60);
    this.p.beginShape();
    for (let point of obs.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);

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

  drawHut(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Enhanced detailed desert hut from top-down perspective
    
    // Larger shadow
    this.p.fill(50, 40, 30, 80);
    this.p.ellipse(8, 8, 50, 40);
    
    // Base foundation - circular platform
    this.p.fill(180, 160, 130);  // Sandy ground color
    this.p.ellipse(0, 0, 55, 55);
    
    // Main structure - circular adobe/mud hut
    this.p.fill(210, 180, 140); // Sandstone/mud walls
    this.p.ellipse(0, 0, 48, 48);
    
    // Inner structure
    this.p.fill(190, 160, 120);
    this.p.ellipse(0, 0, 40, 40);
    
    // Detail lines on the circular wall
    this.p.stroke(170, 140, 110);
    this.p.strokeWeight(1);
    for (let i = 0; i < 12; i++) {
      let angle = i * this.p.TWO_PI / 12;
      this.p.line(
        Math.cos(angle) * 20, 
        Math.sin(angle) * 20,
        Math.cos(angle) * 24, 
        Math.sin(angle) * 24
      );
    }
    this.p.noStroke();
    
    // Entrance (dark opening)
    this.p.fill(60, 50, 40);
    this.p.arc(0, 22, 12, 14, -this.p.PI * 0.8, -this.p.PI * 0.2);
    
    // Conical roof
    this.p.fill(180, 150, 100);
    this.p.ellipse(0, 0, 44, 44);
    this.p.fill(160, 130, 90);
    this.p.ellipse(0, 0, 34, 34);
    this.p.fill(140, 110, 80);
    this.p.ellipse(0, 0, 24, 24);
    this.p.fill(120, 90, 70);
    this.p.ellipse(0, 0, 14, 14);
    
    // Center pole/smoke hole
    this.p.fill(80, 60, 50);
    this.p.ellipse(0, 0, 6, 6);
    
    // Smoke from center
    this.p.noStroke();
    for (let i = 0; i < 3; i++) {
      let t = (this.p.frameCount * 0.01 + i * 0.3) % 1;
      let size = this.p.map(t, 0, 1, 3, 8);
      let alpha = this.p.map(t, 0, 1, 200, 0);
      this.p.fill(200, 200, 200, alpha);
      this.p.ellipse(0, 0 - t * 15, size, size);
    }
    
    // Windmill on side of hut
    this.p.push();
    this.p.translate(16, -10);
    this.p.rotate(this.worldGenerator.getWindmillAngle());
    // Windmill blades
    this.p.fill(100, 80, 60);
    for (let i = 0; i < 4; i++) {
      this.p.push();
      this.p.rotate(i * this.p.PI / 2);
      this.p.beginShape();
      this.p.vertex(0, 0);
      this.p.vertex(2, -10);
      this.p.vertex(-2, -10);
      this.p.endShape(this.p.CLOSE);
      this.p.pop();
    }
    // Center hub
    this.p.fill(120, 120, 120);
    this.p.ellipse(0, 0, 4, 4);
    this.p.pop();
    
    // Satellite dish on roof
    this.p.fill(180, 180, 180);
    this.p.ellipse(-12, -10, 8, 8);
    this.p.fill(150, 150, 150);
    this.p.ellipse(-12, -10, 6, 6);
    this.p.stroke(120, 120, 120);
    this.p.strokeWeight(1);
    this.p.line(-12, -10, -16, -13);
    this.p.noStroke();
    
    // Small decorative elements around the hut
    // Water jars
    this.p.fill(160, 120, 100);
    this.p.ellipse(-18, 10, 8, 8);
    this.p.ellipse(-14, 16, 6, 6);
    
    // Cloth/tarp
    this.p.fill(180, 180, 160);
    this.p.rect(-22, -8, 10, 8, 2);
    
    // Small junk pile on side
    this.p.fill(130, 120, 110);
    this.p.ellipse(18, 14, 15, 10);
    this.p.fill(140, 130, 120);
    this.p.rect(14, 12, 8, 2);
    this.p.rect(18, 14, 6, 3);
    
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
      
      this.p.ellipse(x, y, size, size * 0.8);
    }
    
    this.p.pop();
  }

  drawFuelPump(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    this.p.rotate(obs.angle || 0); // Apply rotation if specified
    
    // Shadow
    this.p.fill(0, 0, 0, 40);
    this.p.ellipse(5, 5, 30, 10);
    
    // Base platform
    this.p.fill(50, 50, 50); // Darker, rustier gray
    this.p.rect(-12, -15, 24, 30, 2);
    
    // Fuel pump body - much more weathered, rusty color
    this.p.fill(110, 50, 40); // More rusty, less vibrant red
    this.p.rect(-10, -15, 20, 25, 1);
    
    // Heavy rust streaks
    this.p.fill(70, 35, 25, 180); // Darker rust color
    this.p.rect(-10, -8, 5, 18, 0);
    this.p.rect(3, -12, 5, 22, 0);
    
    // More rust spots - patches and splotches
    this.p.fill(80, 40, 30, 150);
    this.p.ellipse(-5, -10, 8, 5);
    this.p.ellipse(2, 5, 6, 9);
    
    // Pump details - worn, rusty metal
    this.p.fill(35, 35, 35);
    this.p.rect(-8, -10, 16, 8);
    
    // Pump readings/display - very faded, almost unreadable
    this.p.fill(150, 150, 80, 130); // More faded, dusty yellow
    this.p.rect(-6, -8, 12, 4);
    
    // Scratches on display
    this.p.stroke(70, 70, 60, 100);
    this.p.strokeWeight(1);
    this.p.line(-5, -7, 0, -5);
    this.p.line(2, -8, 5, -6);
    this.p.noStroke();
    
    // Pump nozzle - heavily weathered metal
    this.p.fill(60, 60, 60);
    this.p.rect(5, 0, 10, 3);
    this.p.fill(50, 50, 50);
    this.p.rect(13, -5, 2, 10);
    
    // Top of pump - chipped, worn paint
    this.p.fill(100, 45, 35); // Darker, duller red
    this.p.rect(-8, -18, 16, 3);
    
    // Chipped paint effect on top
    this.p.fill(70, 35, 30);
    this.p.rect(-6, -18, 3, 1);
    this.p.rect(2, -18, 4, 2);
    
    // Fuel barrel next to the pump - very rusty, worn
    this.p.fill(100, 45, 35); // More rusty barrel color
    this.p.ellipse(20, 0, 20, 20);
    
    // Heavy rust on barrel
    this.p.fill(70, 35, 30);
    this.p.arc(20, 0, 20, 20, this.p.PI * 0.2, this.p.PI * 0.8);
    
    // Barrel top - worn, rusty metal
    this.p.fill(80, 35, 25); // Darker rusty color
    this.p.ellipse(20, 0, 15, 15);
    
    // Barrel details - heavy rust streaks and cracks
    this.p.stroke(60, 25, 20);
    this.p.strokeWeight(1);
    this.p.line(14, -4, 26, -4);
    this.p.line(14, 0, 26, 0);
    this.p.line(14, 4, 26, 4);
    this.p.line(20, -7, 20, 7);
    this.p.noStroke();
    
    // Worn hazard symbol on barrel
    this.p.fill(40, 40, 40);
    this.p.push();
    this.p.translate(20, 0);
    this.p.rotate(this.p.PI/4);
    this.p.rect(-4, -1, 8, 2);
    this.p.rect(-1, -4, 2, 8);
    this.p.pop();
    
    this.p.pop();
  }

  drawBush(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    this.p.fill(180, 150, 100, 50);
    let shadowOffsetX = 2 * obs.size;
    let shadowOffsetY = 2 * obs.size;
    let shadowWidth = 10 * obs.size;
    let shadowHeight = 10 * obs.size;
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    this.p.fill(50, 70, 30);
    this.p.beginShape();
    for (let point of obs.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);

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

    this.p.fill(40, 60, 20);
    this.p.ellipse(-3 * obs.size, -2 * obs.size, 2 * obs.size, 1 * obs.size);
    this.p.ellipse(2 * obs.size, 1 * obs.size, 1 * obs.size, 2 * obs.size);
    this.p.fill(100, 120, 80);
    this.p.ellipse(-1 * obs.size, 2 * obs.size, 1 * obs.size, 1 * obs.size);
    this.p.stroke(70, 50, 30);
    this.p.strokeWeight(1 * obs.size);
    this.p.line(0, 0, -5 * obs.size, -3 * obs.size);
    this.p.line(0, 0, 4 * obs.size, -2 * obs.size);
    this.p.noStroke();
    
    this.p.pop();
  }

  drawCactus(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    // Draw shadow
    this.p.fill(180, 150, 100, 50);
    let shadowOffsetX = 2 * obs.size;
    let shadowOffsetY = 2 * obs.size;
    let shadowWidth = 8 * obs.size;
    let shadowHeight = 10 * obs.size;
    this.p.beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = this.p.map(i, 0, 8, 0, this.p.TWO_PI);
      let radiusX = shadowWidth * (0.8 + this.p.noise(angle * 0.5) * 0.4);
      let radiusY = shadowHeight * (0.8 + this.p.noise(angle * 0.5 + 10) * 0.4);
      let x = shadowOffsetX + this.p.cos(angle) * radiusX;
      let y = shadowOffsetY + this.p.sin(angle) * radiusY;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);

    // Draw the cactus base parts first
    for (let part of obs.shape) {
      this.p.fill(40, 80, 40);
      this.p.beginShape();
      for (let point of part.points) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);

      this.p.fill(60, 100, 60);
      this.p.beginShape();
      for (let i = 0; i < part.points.length; i++) {
        let point = part.points[i];
        let offsetX = -1 * obs.size;
        let offsetY = -1 * obs.size;
        this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
      }
      this.p.endShape(this.p.CLOSE);
    }
    
    // Draw the thorns on top of the cactus base
    this.p.fill(200, 200, 150);
    for (let part of obs.shape) {
      if (part.type === 'body') {
        for (let i = 0; i < 5; i++) {
          let t = i / 4;
          let p1 = part.points[0];
          let p2 = part.points[part.points.length - 1];
          let x = this.p.lerp(p1.x, p2.x, t);
          let y = this.p.lerp(p1.y, p2.y, t);
          
          // Draw thorns as lines instead of ellipses
          this.p.push();
          this.p.translate(x, y);
          
          // Left thorn
          this.p.stroke(200, 200, 150);
          this.p.strokeWeight(1);
          this.p.line(0, 0, -5 * obs.size, -2 * obs.size);
          
          // Right thorn
          this.p.line(0, 0, 5 * obs.size, -2 * obs.size);
          this.p.noStroke();
          this.p.pop();
        }
      } else if (part.type === 'arm') {
        for (let i = 0; i < 3; i++) {
          let t = i / 2;
          let p1 = part.points[0];
          let p2 = part.points[part.points.length - 1];
          let x = this.p.lerp(p1.x, p2.x, t);
          let y = this.p.lerp(p1.y, p2.y, t);
          
          // Draw thorns as lines
          this.p.push();
          this.p.translate(x, y);
          this.p.stroke(200, 200, 150);
          this.p.strokeWeight(1);
          this.p.line(0, 0, 0, -4 * obs.size);
          this.p.line(0, 0, 3 * obs.size, -2 * obs.size);
          this.p.line(0, 0, -3 * obs.size, -2 * obs.size);
          this.p.noStroke();
          this.p.pop();
        }
      }
    }
    
    // Draw circle hitbox for debugging/visualization if needed
    /*
    this.p.stroke(255, 0, 0, 100);
    this.p.strokeWeight(1);
    this.p.noFill();
    this.p.ellipse(0, 0, 20 * obs.size, 20 * obs.size);
    this.p.noStroke();
    */
    
    this.p.pop();
  }

  drawResources() {
    let currentResources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    for (let res of currentResources) {
      this.p.push();
      this.p.translate(res.x, res.y);
      
      if (res.type === 'metal') {
        // Rotate to random angle
        this.p.rotate(res.rotation);
        
        // Half-buried metal scraps - lighter color, more square/sheet-like
        let buriedDepth = res.buried; // 0.3-0.7, higher = more buried
        
        // Shadow under the metal
        this.p.fill(80, 80, 80, 100);
        this.p.ellipse(2, 2, 14 * res.size, 4 * res.size);
        
        // Base layer - buried part
        this.p.fill(120, 120, 120);
        this.p.beginShape();
        this.p.vertex(-8 * res.size, buriedDepth * 5 * res.size);
        this.p.vertex(8 * res.size, buriedDepth * 4 * res.size);
        this.p.vertex(7 * res.size, buriedDepth * 8 * res.size);
        this.p.vertex(-7 * res.size, buriedDepth * 7 * res.size);
        this.p.endShape(this.p.CLOSE);
        
        // Main metal sheet
        this.p.fill(200, 200, 210);
        this.p.rect(-6 * res.size, -4 * res.size, 12 * res.size, 8 * res.size, 1);
        
        // Exposed part - showing above ground
        let exposedHeight = this.p.map(buriedDepth, 0.3, 0.7, 6, 3);
        this.p.fill(220, 220, 225);
        this.p.rect(-5 * res.size, -4 * res.size, 10 * res.size, exposedHeight * res.size, 1);
        
        // Add details - rivets, bends, tears
        this.p.fill(180, 180, 185);
        this.p.ellipse(-4 * res.size, -3 * res.size, 1.5 * res.size, 1.5 * res.size);
        this.p.ellipse(0, -3 * res.size, 1.5 * res.size, 1.5 * res.size);
        this.p.ellipse(4 * res.size, -3 * res.size, 1.5 * res.size, 1.5 * res.size);
        
        // Bent/damaged corner
        this.p.fill(190, 190, 195);
        this.p.beginShape();
        this.p.vertex(-6 * res.size, -4 * res.size);
        this.p.vertex(-4 * res.size, -5 * res.size);
        this.p.vertex(-2 * res.size, -4 * res.size);
        this.p.endShape(this.p.CLOSE);
      } else if (res.type === 'copper') {
        // Draw copper ore veins
        this.p.rotate(res.rotation || 0);
        
        // Shadow
        this.p.fill(80, 60, 40, 60);
        this.p.ellipse(3, 3, 16 * res.size, 8 * res.size);
        
        // Base rock
        this.p.fill(100, 90, 75);
        this.p.beginShape();
        for (let i = 0; i < 8; i++) {
          let angle = i * this.p.TWO_PI / 8 + res.rotation;
          let r = 8 * res.size * (0.8 + this.p.noise(i * 0.5 + res.x * 0.01) * 0.4);
          let x = this.p.cos(angle) * r;
          let y = this.p.sin(angle) * r;
          this.p.vertex(x, y);
        }
        this.p.endShape(this.p.CLOSE);
        
        // Copper veins
        this.p.fill(180, 120, 40);
        for (let i = 0; i < 4; i++) {
          let angle = i * this.p.TWO_PI / 4 + res.rotation + 0.5;
          let x = this.p.cos(angle) * 4 * res.size * this.p.noise(i);
          let y = this.p.sin(angle) * 4 * res.size * this.p.noise(i + 10);
          let veinSize = 2 + this.p.noise(i * 5) * 3;
          
          this.p.beginShape();
          for (let j = 0; j < 5; j++) {
            let vx = x + this.p.cos(j * this.p.TWO_PI / 5) * veinSize;
            let vy = y + this.p.sin(j * this.p.TWO_PI / 5) * veinSize;
            this.p.vertex(vx, vy);
          }
          this.p.endShape(this.p.CLOSE);
        }
        
        // Copper highlights
        this.p.fill(220, 160, 30, 150);
        for (let i = 0; i < 6; i++) {
          let angle = i * this.p.TWO_PI / 6 + res.rotation + 0.2;
          let dist = this.p.noise(i * 2) * 5 * res.size;
          let x = this.p.cos(angle) * dist;
          let y = this.p.sin(angle) * dist;
          let size = this.p.noise(i * 3) * 2 * res.size;
          
          this.p.ellipse(x, y, size, size);
        }
      }
      
      this.p.pop();
    }
  }
}
