import p5 from 'p5';

export default class GameRenderer {
  p: any;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  screenShakeAmount: number = 0;
  screenShakeTime: number = 0;
  dayTimeIcon: string;
  dayTimeAngle: number;

  constructor(p: any, worldGenerator: any, player: any, hoverbike: any, worldX: number, worldY: number, timeOfDay: number = 0.25, dayTimeIcon: string = 'sun', dayTimeAngle: number = Math.PI / 2) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
    this.dayTimeIcon = dayTimeIcon;
    this.dayTimeAngle = dayTimeAngle;
  }

  setWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
  }
  
  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }
  
  setDayTimeIcon(dayTimeIcon: string) {
    this.dayTimeIcon = dayTimeIcon;
  }
  
  setDayTimeAngle(dayTimeAngle: number) {
    this.dayTimeAngle = dayTimeAngle;
  }

  startScreenShake(intensity: number, duration: number) {
    this.screenShakeAmount = intensity;
    this.screenShakeTime = duration;
  }

  render() {
    // Apply screen shake if active
    if (this.screenShakeTime > 0) {
      this.p.push();
      this.p.translate(
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount),
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount)
      );
      this.screenShakeTime--;
      
      // Draw the normal scene
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.renderObstacles();
      this.drawResources();
      
      // Draw hoverbike (middle z-index)
      if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.hoverbike.display();
      }
      
      // Draw player (higher z-index)
      this.player.display();
      
      // Draw fuel canisters (high z-index)
      this.drawFuelCanisters();
      
      this.p.pop();
    } else {
      // Normal rendering without screen shake
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.renderObstacles();
      this.drawResources();
      
      // Draw hoverbike (middle z-index)
      if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.hoverbike.display();
      }
      
      // Draw player (higher z-index)
      this.player.display();
      
      // Draw fuel canisters (high z-index)
      this.drawFuelCanisters();
    }
  }

  drawBackground() {
    let zoneKey = `${this.worldX},${this.worldY}`;
    if (this.worldGenerator.getSandTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getSandTexture(zoneKey), 0, 0);
    }
    if (this.worldGenerator.getGrassTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getGrassTexture(zoneKey), 0, 0);
    }
  }
  
  applyDaytimeTint() {
    // Apply color tint based on time of day
    // 0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset, 1 = midnight
    
    // Clear any previous tint
    this.p.noTint();
    
    if (this.timeOfDay < 0.25) {
      // Midnight to sunrise: blue night tint getting lighter
      const blendFactor = this.timeOfDay / 0.25; // 0 to 1
      const r = this.p.lerp(20, 150, blendFactor);
      const g = this.p.lerp(20, 120, blendFactor);
      const b = this.p.lerp(50, 100, blendFactor);
      const alpha = this.p.lerp(200, 30, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.5) {
      // Sunrise to noon: orangey sunrise to clear day
      const blendFactor = (this.timeOfDay - 0.25) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(150, 255, blendFactor);
      const b = this.p.lerp(100, 255, blendFactor);
      const alpha = this.p.lerp(40, 0, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.75) {
      // Noon to sunset: clear day to orangey sunset
      const blendFactor = (this.timeOfDay - 0.5) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(255, 120, blendFactor);
      const b = this.p.lerp(255, 50, blendFactor);
      const alpha = this.p.lerp(0, 60, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else {
      // Sunset to midnight: orangey sunset to blue night
      const blendFactor = (this.timeOfDay - 0.75) / 0.25; // 0 to 1
      const r = this.p.lerp(255, 20, blendFactor);
      const g = this.p.lerp(120, 20, blendFactor);
      const b = this.p.lerp(50, 50, blendFactor);
      const alpha = this.p.lerp(60, 200, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
  }

  drawTarp() {
    // Draw tarp in the current area if it exists
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    let currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'tarp') {
        this.p.push();
        
        // Draw tarp shadow
        this.p.fill(0, 0, 0, 40);
        this.p.noStroke();
        this.p.rect(
          obs.x - obs.width/2 + 10, 
          obs.y - obs.height/2 + 10, 
          obs.width, 
          obs.height
        );
        
        // Draw tarp base
        this.p.fill(obs.color.r, obs.color.g, obs.color.b);
        this.p.stroke(0);
        this.p.strokeWeight(2);
        this.p.rect(
          obs.x - obs.width/2, 
          obs.y - obs.height/2, 
          obs.width, 
          obs.height
        );
        
        // Draw pole structure
        this.p.stroke(60, 40, 30);
        this.p.strokeWeight(3);
        
        // Corner poles
        this.p.line(
          obs.x - obs.width/2, 
          obs.y - obs.height/2,
          obs.x - obs.width/2, 
          obs.y - obs.height/2 - 15
        );
        
        this.p.line(
          obs.x + obs.width/2, 
          obs.y - obs.height/2,
          obs.x + obs.width/2, 
          obs.y - obs.height/2 - 8
        );
        
        this.p.line(
          obs.x - obs.width/2, 
          obs.y + obs.height/2,
          obs.x - obs.width/2, 
          obs.y + obs.height/2 + 5
        );
        
        this.p.line(
          obs.x + obs.width/2, 
          obs.y + obs.height/2,
          obs.x + obs.width/2, 
          obs.y + obs.height/2 + 10
        );
        
        // Draw fold lines on tarp
        this.p.stroke(0, 0, 0, 50);
        this.p.strokeWeight(1);
        
        for (let i = 1; i < 4; i++) {
          this.p.line(
            obs.x - obs.width/2, 
            obs.y - obs.height/2 + (i * obs.height/4),
            obs.x + obs.width/2, 
            obs.y - obs.height/2 + (i * obs.height/4)
          );
        }
        
        for (let i = 1; i < 3; i++) {
          this.p.line(
            obs.x - obs.width/2 + (i * obs.width/3), 
            obs.y - obs.height/2,
            obs.x - obs.width/2 + (i * obs.width/3), 
            obs.y + obs.height/2
          );
        }
        
        // Draw tarp highlights
        this.p.noStroke();
        this.p.fill(255, 255, 255, 40);
        this.p.rect(
          obs.x - obs.width/2 + 5, 
          obs.y - obs.height/2 + 5, 
          obs.width - 10, 
          10
        );
        
        this.p.pop();
      }
    }
  }
  
  renderObstacles() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    for (const obstacle of currentObstacles) {
      if (obstacle.type === 'rock') {
        this.drawRock(obstacle);
      } else if (obstacle.type === 'hut') {
        this.drawHut(obstacle);
      } else if (obstacle.type === 'bush') {
        this.drawBush(obstacle);
      } else if (obstacle.type === 'cactus') {
        this.drawCactus(obstacle);
      } else if (obstacle.type === 'fuelPump') {
        this.drawFuelPump(obstacle);
      } else if (obstacle.type === 'fuelStain') {
        this.drawFuelStain(obstacle);
      } else if (obstacle.type === 'walkingMarks') {
        this.drawWalkingMarks(obstacle);
      } else if (obstacle.type === 'militaryCrate') {
        this.renderMilitaryCrate(obstacle);
      } else if (obstacle.type === 'outpost') {
        this.renderOutpost(obstacle);
      }
    }
  }
  
  renderMilitaryCrate(crate) {
    this.p.push();
    this.p.translate(crate.x, crate.y);
    
    // Draw crate shadow
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 5, 35, 12);
    
    // Scale crate
    const scale = crate.size || 1.0;
    this.p.scale(scale);
    
    if (!crate.opened) {
      // Draw closed crate
      this.p.fill(60, 70, 65);
      this.p.stroke(40);
      this.p.strokeWeight(1);
      this.p.rect(-15, -12, 30, 20, 2);
      
      // Draw crate details
      this.p.fill(50, 60, 55);
      this.p.rect(-12, -9, 24, 3);
      
      // Draw hinges
      this.p.fill(40);
      this.p.rect(-14, -12, 3, 2);
      this.p.rect(11, -12, 3, 2);
      
      // Draw lock
      this.p.fill(80);
      this.p.rect(-3, -8, 6, 4);
      
      // Draw military symbol
      this.p.fill(100, 30, 30);
      this.p.noStroke();
      this.p.beginShape();
      this.p.vertex(-6, 0);
      this.p.vertex(0, -5);
      this.p.vertex(6, 0);
      this.p.vertex(0, 5);
      this.p.endShape(this.p.CLOSE);
      
      // If player is nearby, show "Press E" prompt
      const distance = this.p.dist(this.player.x, this.player.y, crate.x, crate.y);
      if (distance < 40) {
        this.p.fill(255);
        this.p.noStroke();
        this.p.textAlign(this.p.CENTER);
        this.p.textSize(10);
        this.p.text("Press E", 0, -18);
      }
    } else {
      // Draw opened crate
      // Base
      this.p.fill(60, 70, 65);
      this.p.stroke(40);
      this.p.strokeWeight(1);
      this.p.rect(-15, -8, 30, 16, 2);
      
      // Lid opened
      this.p.fill(55, 65, 60);
      this.p.beginShape();
      this.p.vertex(-15, -8);
      this.p.vertex(15, -8);
      this.p.vertex(15, -20);
      this.p.vertex(-15, -20);
      this.p.endShape(this.p.CLOSE);
      
      // Inside crate (empty)
      this.p.fill(40, 45, 42);
      this.p.rect(-12, -5, 24, 10);
      
      // Hinges
      this.p.fill(40);
      this.p.rect(-14, -8, 3, 2);
      this.p.rect(11, -8, 3, 2);
    }
    
    this.p.pop();
  }

  renderOutpost(outpost) {
    this.p.push();
    this.p.translate(outpost.x, outpost.y);
    
    // Draw outpost shadow
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(5, 8, 70, 20);
    
    // Scale outpost
    const scale = outpost.size || 1.2;
    this.p.scale(scale);
    
    // Main building structure
    this.p.fill(80, 90, 95);
    this.p.stroke(60, 70, 75);
    this.p.strokeWeight(1);
    this.p.rect(-25, -30, 50, 40, 3);
    
    // Doorway
    this.p.fill(50, 55, 60);
    this.p.rect(-8, -5, 16, 15, 2);
    
    // Windows (broken)
    this.p.fill(70, 100, 110, 180);
    this.p.rect(-18, -22, 10, 8);
    this.p.rect(8, -22, 10, 8);
    
    // Cracked window lines
    this.p.stroke(200, 220, 230, 150);
    this.p.strokeWeight(0.5);
    this.p.line(-18, -18, -8, -22);
    this.p.line(12, -19, 18, -14);
    
    // Antenna/dish
    this.p.fill(90);
    this.p.stroke(70);
    this.p.strokeWeight(1);
    this.p.rect(-20, -35, 2, 10);
    this.p.ellipse(-15, -35, 10, 5);
    
    // Roof damage
    this.p.fill(60, 65, 70);
    this.p.noStroke();
    this.p.beginShape();
    this.p.vertex(10, -30);
    this.p.vertex(20, -30);
    this.p.vertex(15, -25);
    this.p.endShape(this.p.CLOSE);
    
    // If player is nearby, show "Press E" prompt
    const distance = this.p.dist(this.player.x, this.player.y, outpost.x, outpost.y);
    if (distance < 40) {
      this.p.fill(255);
      this.p.noStroke();
      this.p.textAlign(this.p.CENTER);
      this.p.textSize(10);
      this.p.text("Press E", 0, -40);
    }
    
    this.p.pop();
  }
  
  drawObstacles() {
    let currentObstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    for (let obs of currentObstacles) {
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
        this.drawFuelStain(obs);
      } else if (obs.type === 'walkingMarks') {
        this.drawWalkingMarks(obs);
      }
    }
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

    // Draw shadow
    this.p.fill(50, 40, 30, 80);
    let shadowOffsetX = 5 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    // Base rock shape
    this.p.fill(80, 70, 60);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.beginShape();
    for (let point of obs.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);

    // Lighter section
    this.p.fill(100, 90, 80);
    this.p.noStroke();
    this.p.beginShape();
    for (let point of obs.shape) {
      let offsetX = 2 * obs.size;
      let offsetY = 2 * obs.size;
      this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
    }
    this.p.endShape(this.p.CLOSE);

    // Darkest section
    this.p.fill(120, 110, 100);
    this.p.beginShape();
    for (let point of obs.shape) {
      let offsetX = -2 * obs.size;
      let offsetY = -2 * obs.size;
      this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
    }
    this.p.endShape(this.p.CLOSE);

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

  drawFuelPump(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    this.p.rotate(this.p.radians(70)); // Rotate 70 degrees
    
    // Larger, more defined shadow
    this.p.fill(0, 0, 0, 50);
    this.p.ellipse(8, 8, 55, 35);
    
    // Base platform - concrete/metal pad
    this.p.fill(80, 80, 85);
    this.p.rect(-30, -25, 60, 50, 2);
    
    // Weathered concrete stains
    this.p.fill(100, 100, 100, 80);
    this.p.ellipse(-10, 0, 25, 30);
    this.p.fill(90, 90, 90, 60);
    this.p.ellipse(5, 8, 28, 22);
    
    // Oil stains on platform
    this.p.fill(20, 20, 20, 70);
    this.p.ellipse(0, -5, 20, 15);
    this.p.ellipse(-5, 15, 12, 18);
    
    // Draw the main pumpjack structure
    
    // Base housing/engine - rusty metal box
    this.p.fill(120, 80, 60); // Rusty brown color
    this.p.rect(-18, -12, 16, 20, 1);
    
    // Rust streaks on housing
    this.p.fill(90, 50, 35, 200);
    this.p.rect(-18, -8, 5, 16);
    this.p.fill(100, 60, 40, 150);
    this.p.rect(-12, -12, 8, 5);
    
    // Main beam structure (the "horse head")
    this.p.fill(70, 70, 75); // Dark metal
    this.p.beginShape();
    this.p.vertex(-5, -10); // Connection point
    this.p.vertex(15, -10); // Front tip
    this.p.vertex(15, -5);  // Front bottom
    this.p.vertex(-5, -5);  // Connection bottom
    this.p.endShape(this.p.CLOSE);
    
    // Counterweight (back of walking beam)
    this.p.fill(80, 80, 90);
    this.p.rect(-14, -14, 10, 8, 1);
    this.p.fill(60, 60, 65); // Darker metal for details
    this.p.ellipse(-9, -10, 8, 8);
    
    // Walking beam (the moving horizontal part)
    // Position will depend on animation state - here showing a static position
    this.p.fill(90, 90, 100);
    this.p.rect(-12, -10, 24, 3, 1);
    
    // Pitman arm (connecting to the crank)
    this.p.stroke(70, 70, 75);
    this.p.strokeWeight(2);
    this.p.line(8, -8, 2, 5); // Angled connecting rod
    this.p.noStroke();
    
    // Crank and counterbalance
    this.p.fill(60, 60, 65);
    this.p.ellipse(0, 8, 10, 10); // Crank disk
    this.p.fill(80, 80, 85);
    this.p.ellipse(0, 8, 6, 6); // Crank center
    
    // Polished rod (moving up and down into wellhead)
    this.p.fill(180, 180, 190);
    this.p.rect(14, -9, 2, 10);
    
    // Wellhead - where the polished rod enters the ground
    this.p.fill(100, 60, 50); // Rusty wellhead
    this.p.ellipse(15, 0, 10, 8);
    this.p.fill(120, 70, 60);
    this.p.ellipse(15, 0, 6, 5);
    
    // Oil puddle near wellhead
    this.p.fill(30, 30, 30, 120);
    this.p.ellipse(15, 5, 12, 8);
    
    // Pipes running from the wellhead
    this.p.stroke(110, 70, 60);
    this.p.strokeWeight(3);
    this.p.line(15, 4, 15, 12);
    this.p.line(15, 12, 25, 12);
    this.p.noStroke();
    
    // Small blinking light to indicate activity
    const blinkRate = Math.sin(this.p.frameCount * 0.05) > 0;
    if (blinkRate) {
      this.p.fill(200, 50, 50, 180); // Red indicator light
      this.p.ellipse(-14, -16, 3, 3);
    }

    // ----- FUEL STATION AREA -----
    
    // Fuel dispenser in front of the pumpjack
    this.p.push();
    this.p.translate(0, 30); // Position in front of the pumpjack
    
    // Dispenser base
    this.p.fill(70, 70, 75);
    this.p.rect(-10, -5, 20, 15, 2);
    
    // Dispenser body
    this.p.fill(90, 50, 40); // Rusty red
    this.p.rect(-8, -15, 16, 12, 1);
    
    // Display panel
    this.p.fill(40, 40, 45);
    this.p.rect(-5, -13, 10, 8, 1);
    
    // Display digits/numbers
    this.p.fill(180, 60, 40);
    for (let i = 0; i < 3; i++) {
      this.p.rect(-3 + i * 2, -11, 1.5, 4, 0.5);
    }
    
    // Fuel nozzle holder
    this.p.fill(60, 60, 65);
    this.p.rect(-6, -3, 12, 3, 1);
    
    // Fuel nozzle
    this.p.fill(80, 80, 85);
    this.p.rect(3, -2, 3, 6, 1);
    
    // Fuel hose
    this.p.stroke(40, 40, 45);
    this.p.strokeWeight(2);
    this.p.noFill();
    this.p.bezier(4, 0, 8, 4, 12, 5, 14, 2);
    this.p.noStroke();
    
    // Rust patches on dispenser
    this.p.fill(110, 70, 50, 180);
    this.p.rect(-8, -8, 4, 5, 1);
    this.p.ellipse(5, -10, 4, 3);
    
    // Ground marker lines
    this.p.fill(255, 255, 0, 120); // Faded yellow
    this.p.rect(-15, 12, 30, 2);
    this.p.rect(-15, 16, 30, 2);
    
    // Worn parking spot
    this.p.fill(70, 70, 75, 100);
    this.p.rect(-20, -5, 40, 25, 3);
    this.p.pop();
    
    // ----- END FUEL STATION AREA -----
    
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

    this.p.fill(180, 150, 100, 50);
    let shadowOffsetX = -5;
    let shadowOffsetY = -5;
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

      this.p.fill(50, 90, 50);
      for (let i = 0; i < part.points.length - 1; i += 2) {
        let p1 = part.points[i];
        let p2 = part.points[i + 1];
        this.p.ellipse((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 2 * obs.size, 2 * obs.size);
      }
    }

    this.p.fill(200, 200, 150);
    for (let part of obs.shape) {
      if (part.type === 'body') {
        for (let i = 0; i < 5; i++) {
          let t = i / 4;
          let p1 = part.points[0];
          let p2 = part.points[part.points.length - 1];
          let x = this.p.lerp(p1.x, p2.x, t);
          let y = this.p.lerp(p1.y, p2.y, t);
          this.p.ellipse(x, y, 1 * obs.size, 1 * obs.size);
        }
      }
    }

    this.p.pop();
  }

  drawResources() {
    let currentResources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    for (let resource of currentResources) {
      if (resource.type === 'metal') {
        this.drawMetal(resource);
      } else if (resource.type === 'copper') {
        this.drawCopper(resource);
      } else if (resource.type === 'health') {
        this.drawHealth(resource);
      } else if (resource.type === 'fuelCanister') {
        this.drawFuelCanister(resource);
      }
    }
  }

  drawMetal(resource: any) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    // Shadow
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 16, 10);
    
    // Base shape - cylindrical metal chunk
    this.p.fill(120, 120, 130);
    this.p.beginShape();
    for (let i = 0; i < 8; i++) {
      let angle = i * this.p.TWO_PI / 8;
      let radius = 6 + this.p.noise(i * 0.5) * 2;
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Highlight
    this.p.fill(180, 180, 190);
    this.p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = i * this.p.TWO_PI / 6 + 0.3;
      let radius = 4 + this.p.noise(i * 0.8) * 1;
      let x = Math.cos(angle) * radius * 0.8 - 1;
      let y = Math.sin(angle) * radius * 0.8 - 1;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Weathering details
    this.p.fill(90, 90, 100);
    this.p.ellipse(-2, 3, 3, 2);
    this.p.ellipse(3, -2, 2, 2);
    
    this.p.pop();
  }

  drawCopper(resource: any) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    // Shadow
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 14, 10);
    
    // Base shape - copper nugget
    this.p.fill(210, 120, 70); // Copper color
    this.p.beginShape();
    for (let i = 0; i < 7; i++) {
      let angle = i * this.p.TWO_PI / 7 + 0.2;
      let radius = 5 + this.p.noise(i * 0.7) * 3;
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Highlight
    this.p.fill(230, 160, 100);
    this.p.beginShape();
    for (let i = 0; i < 5; i++) {
      let angle = i * this.p.TWO_PI / 5 + 0.5;
      let radius = 3 + this.p.noise(i * 0.9) * 1.5;
      let x = Math.cos(angle) * radius * 0.7 - 0.5;
      let y = Math.sin(angle) * radius * 0.7 - 1;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Oxidization details - green patches
    this.p.fill(100, 180, 120, 180);
    this.p.ellipse(-1, 2, 3, 2);
    this.p.ellipse(2, -1, 2, 1.5);
    this.p.ellipse(-2, -2, 1.5, 1.5);
    
    this.p.pop();
  }

  drawHealth(resource: any) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    // Shadow
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 15, 10);
    
    // Base shape - medical kit
    this.p.fill(220, 220, 220);
    this.p.rect(-6, -5, 12, 10, 2);
    
    // Red cross
    this.p.fill(200, 50, 50);
    this.p.rect(-4, -1, 8, 2);
    this.p.rect(-1, -4, 2, 8);
    
    // Highlights
    this.p.fill(240, 240, 240);
    this.p.rect(-5, -4, 10, 1);
    
    // Clasp/latch
    this.p.fill(150, 150, 150);
    this.p.rect(-1, 3, 2, 1);
    
    // Pulsing effect
    let pulseSize = 1 + Math.sin(this.p.frameCount * 0.1) * 0.2;
    this.p.noFill();
    this.p.stroke(200, 50, 50, 100 - Math.abs(Math.sin(this.p.frameCount * 0.1) * 100));
    this.p.strokeWeight(1);
    this.p.ellipse(0, 0, 15 * pulseSize, 13 * pulseSize);
    this.p.noStroke();
    
    this.p.pop();
  }

  drawFuelCanisters() {
    // Draw fuel canisters in the current area
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    
    // Check resources for fuel canisters too (in case they're stored as resources)
    const currentResources = this.worldGenerator.getResources()[currentAreaKey] || [];
    
    for (const obstacle of currentObstacles) {
      if (obstacle.type === 'fuelCanister' && !obstacle.collected) {
        this.drawFuelCanister(obstacle);
      }
    }
    
    // Also check in resources (just to be safe)
    for (const resource of currentResources) {
      if (resource.type === 'fuelCanister' && !resource.collected) {
        this.drawFuelCanister(resource);
      }
    }
  }

  drawFuelCanister(item: any) {
    if (item.collected) return;
    
    this.p.push();
    this.p.translate(item.x, item.y);
    
    // Draw shadow under the canister
    this.p.fill(0, 0, 0, 50);
    this.p.noStroke();
    this.p.ellipse(2, 2, 10, 6);
    
    // Canister base color (slightly darker red for worn look)
    this.p.fill(190, 45, 45);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.rect(-4, -5, 8, 10, 1);
    
    // Weathered scratches and details
    this.p.stroke(120, 30, 30);
    this.p.strokeWeight(0.5);
    this.p.line(-3, -3, -1, -1);
    this.p.line(1, 2, 3, 4);
    this.p.line(-2, 3, 0, 3);
    
    // Rust spots
    this.p.noStroke();
    this.p.fill(130, 70, 40, 180);
    this.p.ellipse(-2, 2, 2, 1);
    this.p.ellipse(3, -2, 1.5, 1);
    this.p.ellipse(0, 0, 1, 2);
    
    // Dirt streaks
    this.p.fill(80, 60, 40, 120);
    this.p.rect(2, -3, 1, 5, 0.5);
    this.p.rect(-3, 0, 4, 1, 0.5);
    
    // Worn metal highlights
    this.p.fill(220, 170, 170, 100);
    this.p.rect(-3, -4, 2, 1, 0.5);
    this.p.rect(2, 2, 1, 2, 0.5);
    
    // Canister cap (darker and worn looking)
    this.p.fill(40);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.rect(-2, -7, 4, 2);
    
    // Worn cap details
    this.p.stroke(100);
    this.p.strokeWeight(0.5);
    this.p.line(-1, -6.5, 1, -6.5);
    
    // Canister handle (worn metal)
    this.p.stroke(80, 80, 90);
    this.p.strokeWeight(1);
    this.p.line(-3, -5, 3, -5);
    
    // Fuel level indicator (faded)
    this.p.noStroke();
    this.p.fill(150, 150, 150, 180);
    this.p.rect(3, -4, 0.5, 7);
    
    // Safety warnings (faded text)
    this.p.fill(240, 220, 0, 100);
    this.p.rect(-3.5, -2, 2, 0.5);
    this.p.rect(-3.5, -1, 2, 0.5);
    
    // Add a subtle glow/highlight effect to make it more visible
    const pulseSize = 1 + Math.sin(this.p.frameCount * 0.05) * 0.1;
    this.p.noFill();
    this.p.stroke(255, 200, 0, 40 + Math.abs(Math.sin(this.p.frameCount * 0.05) * 20));
    this.p.strokeWeight(0.8);
    this.p.ellipse(0, 0, 14 * pulseSize, 16 * pulseSize);
    this.p.noStroke();
    
    this.p.pop();
  }
}
