
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
      this.drawObstacles();
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
      this.drawObstacles();
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
      } else if (obs.type === 'fuelCanister') {
        this.drawFuelCanister(obs);
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

    this.p.pop();
  }
  
  drawBush(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Shadow
    this.p.fill(40, 40, 40, 50);
    this.p.ellipse(3, 3, 18 * obs.size, 10 * obs.size);
    
    // Base color - brownish stems
    this.p.fill(100, 80, 40);
    this.p.ellipse(0, 0, 8 * obs.size, 8 * obs.size);
    
    // Foliage - main bush shape
    for (let i = 0; i < 8; i++) {
      let angle = i * this.p.TWO_PI / 8;
      let r = obs.size * (6 + this.p.random(-1, 1));
      let x = Math.cos(angle) * r;
      let y = Math.sin(angle) * r;
      
      // Random bush cluster colors - desert plants
      let randomHue = this.p.random(10);
      if (randomHue < 3) {
        // Sage green / gray-green
        this.p.fill(120 + this.p.random(-20, 20), 
                 130 + this.p.random(-10, 10), 
                 110 + this.p.random(-10, 10));
      } else if (randomHue < 6) {
        // Dusty olive
        this.p.fill(130 + this.p.random(-10, 10), 
                 120 + this.p.random(-10, 10), 
                 80 + this.p.random(-20, 20));
      } else {
        // Brownish green
        this.p.fill(110 + this.p.random(-10, 10), 
                 100 + this.p.random(-20, 20), 
                 70 + this.p.random(-10, 10));
      }
      
      this.p.ellipse(x, y, 10 * obs.size, 10 * obs.size);
    }
    
    // Additional detail - small branches/twigs sticking out
    this.p.stroke(80, 60, 40);
    this.p.strokeWeight(1);
    for (let i = 0; i < 5; i++) {
      let angle = this.p.random(this.p.TWO_PI);
      let len = this.p.random(4, 8) * obs.size;
      let x1 = Math.cos(angle) * 4 * obs.size;
      let y1 = Math.sin(angle) * 4 * obs.size;
      let x2 = Math.cos(angle) * len;
      let y2 = Math.sin(angle) * len;
      this.p.line(x1, y1, x2, y2);
    }
    
    // If it's a flowering bush, add small flowers
    if (obs.flowering) {
      this.p.noStroke();
      for (let i = 0; i < 6; i++) {
        let angle = this.p.random(this.p.TWO_PI);
        let r = this.p.random(4, 9) * obs.size;
        let x = Math.cos(angle) * r;
        let y = Math.sin(angle) * r;
        
        // Small desert flower - defaults to yellow but can be other colors
        let flowerColor = obs.flowerColor || {r: 240, g: 220, b: 110};
        this.p.fill(flowerColor.r, flowerColor.g, flowerColor.b);
        this.p.ellipse(x, y, 3 * obs.size, 3 * obs.size);
        
        // Flower center
        this.p.fill(220, 180, 20);
        this.p.ellipse(x, y, 1 * obs.size, 1 * obs.size);
      }
    }
    
    this.p.pop();
  }
  
  drawCactus(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Shadow
    this.p.fill(40, 40, 40, 50);
    this.p.ellipse(3, 5, 10 * obs.size, 6 * obs.size);
    
    // Main cactus body - saguaro type
    this.p.fill(60, 110, 80); // Cactus green
    this.p.rect(-2 * obs.size, -10 * obs.size, 4 * obs.size, 20 * obs.size, 4);
    
    // Cactus arms
    this.p.push();
    this.p.translate(-2 * obs.size, -5 * obs.size);
    this.p.rotate(this.p.radians(-30));
    this.p.rect(0, 0, 3 * obs.size, 10 * obs.size, 3);
    this.p.pop();
    
    this.p.push();
    this.p.translate(2 * obs.size, -3 * obs.size);
    this.p.rotate(this.p.radians(40));
    this.p.rect(0, 0, 3 * obs.size, 8 * obs.size, 3);
    this.p.pop();
    
    // Cactus details - ridges
    this.p.stroke(40, 90, 60);
    this.p.strokeWeight(0.5);
    
    // Vertical lines on main body
    this.p.line(0, -10 * obs.size, 0, 10 * obs.size);
    this.p.line(-1 * obs.size, -10 * obs.size, -1 * obs.size, 10 * obs.size);
    this.p.line(1 * obs.size, -10 * obs.size, 1 * obs.size, 10 * obs.size);
    
    // Spikes
    this.p.stroke(220, 220, 180);
    this.p.strokeWeight(0.8);
    
    for (let i = -8; i <= 8; i += 2) {
      // Spikes on main body
      this.p.line(-2 * obs.size, i * obs.size, -4 * obs.size, i * obs.size);
      this.p.line(2 * obs.size, i * obs.size, 4 * obs.size, i * obs.size);
    }
    
    // If the cactus has flowers
    if (obs.flowering) {
      this.p.noStroke();
      this.p.fill(240, 100, 120); // Bright pink flowers typical of desert cacti
      
      // Top flower
      this.p.ellipse(0, -11 * obs.size, 5 * obs.size, 5 * obs.size);
      
      // Side flowers
      this.p.ellipse(-4 * obs.size, -6 * obs.size, 3 * obs.size, 3 * obs.size);
      this.p.ellipse(4 * obs.size, -4 * obs.size, 3 * obs.size, 3 * obs.size);
      
      // Yellow centers
      this.p.fill(250, 240, 110);
      this.p.ellipse(0, -11 * obs.size, 2 * obs.size, 2 * obs.size);
      this.p.ellipse(-4 * obs.size, -6 * obs.size, 1 * obs.size, 1 * obs.size);
      this.p.ellipse(4 * obs.size, -4 * obs.size, 1 * obs.size, 1 * obs.size);
    }
    
    this.p.pop();
  }
  
  drawResources() {
    // Get resources for current location
    let resources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    
    for (let res of resources) {
      if (res.type === 'metal') {
        this.drawMetalResource(res);
      } else if (res.type === 'copper') {
        this.drawCopperResource(res);
      } else if (res.type === 'fuelCanister') {
        this.drawFuelCanister(res);
      }
    }
  }
  
  drawMetalResource(res: any) {
    this.p.push();
    this.p.translate(res.x, res.y);
    
    // Draw a subtle crater or disturbance in the ground
    this.p.fill(150, 130, 100);
    this.p.noStroke();
    this.p.ellipse(0, 0, 25, 20);
    
    // Draw partially exposed metal chunks
    this.p.fill(120, 120, 140);
    this.p.ellipse(-5, -3, 8, 6);
    this.p.rect(-2, 2, 7, 5, 1);
    
    // Add metallic highlights
    this.p.fill(180, 180, 200, 150);
    this.p.ellipse(-5, -4, 3, 2);
    this.p.rect(0, 3, 3, 2, 1);
    
    // Add a small icon above if the resource is diggable
    if (res.diggable) {
      this.p.fill(255, 255, 255, this.p.map(Math.sin(this.p.frameCount * 0.1), -1, 1, 100, 200));
      this.p.ellipse(0, -15, 5, 5);
    }
    
    this.p.pop();
  }
  
  drawCopperResource(res: any) {
    this.p.push();
    this.p.translate(res.x, res.y);
    
    // Draw a subtle crater or disturbance in the ground
    this.p.fill(160, 140, 110);
    this.p.noStroke();
    this.p.ellipse(0, 0, 22, 18);
    
    // Draw partially exposed copper chunks with distinctive color
    this.p.fill(180, 100, 60); // Copper-orange color
    this.p.ellipse(-4, -2, 7, 5);
    this.p.rect(-1, 1, 6, 4, 1);
    
    // Add coppery highlights with patina
    this.p.fill(100, 160, 140, 120); // Turquoise patina
    this.p.ellipse(-3, -1, 3, 2);
    
    this.p.fill(220, 150, 100, 150); // Shiny copper highlight
    this.p.ellipse(1, 2, 2, 2);
    
    // Add a small icon above if the resource is diggable
    if (res.diggable) {
      this.p.fill(255, 255, 255, this.p.map(Math.sin(this.p.frameCount * 0.1), -1, 1, 100, 200));
      this.p.ellipse(0, -15, 5, 5);
    }
    
    this.p.pop();
  }
  
  drawFuelCanister(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Draw shadow
    this.p.fill(0, 0, 0, 60);
    this.p.ellipse(3, 3, 14, 6);
    
    // Main canister body - cylinder shape
    this.p.fill(220, 60, 40); // Red canister
    this.p.rect(-5, -8, 10, 16, 1);
    
    // Top cap
    this.p.fill(50, 50, 50);
    this.p.rect(-3, -10, 6, 2, 1);
    
    // Spout/nozzle
    this.p.fill(70, 70, 70);
    this.p.rect(-1, -12, 2, 2);
    
    // Handle
    this.p.stroke(70, 70, 70);
    this.p.strokeWeight(2);
    this.p.noFill();
    this.p.arc(0, -8, 8, 4, this.p.PI, this.p.TWO_PI);
    
    // Canister details - stripes or markings
    this.p.noStroke();
    this.p.fill(240, 240, 0); // Yellow warning stripe
    this.p.rect(-5, -2, 10, 3);
    
    // Fuel icon or text
    this.p.fill(240, 240, 240);
    this.p.textSize(3);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.text("FUEL", 0, -4);
    
    // Highlight glint
    this.p.fill(255, 255, 255, 100);
    this.p.ellipse(3, -5, 2, 6);
    
    // If the canister is glowing/highlighted (for visibility)
    if (obs.highlightEffect) {
      const pulseIntensity = Math.sin(this.p.frameCount * 0.1) * 0.5 + 0.5;
      this.p.stroke(255, 255, 100, 100 * pulseIntensity);
      this.p.strokeWeight(2 + pulseIntensity);
      this.p.noFill();
      this.p.ellipse(0, 0, 20, 20);
      this.p.stroke(255, 255, 100, 50 * pulseIntensity);
      this.p.strokeWeight(4 + pulseIntensity);
      this.p.ellipse(0, 0, 26, 26);
    }
    
    this.p.pop();
  }
  
  drawFuelCanisters() {
    // Draw fuel canisters in the current area
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    
    // Get canisters from both obstacles and resources
    let obstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    let resources = this.worldGenerator.getResources()[currentAreaKey] || [];
    
    // Draw canisters from obstacles array
    for (let obs of obstacles) {
      if (obs.type === 'fuelCanister') {
        // Add highlight effect to make them more visible
        obs.highlightEffect = true;
        this.drawFuelCanister(obs);
      }
    }
    
    // Draw canisters from resources array
    for (let res of resources) {
      if (res.type === 'fuelCanister') {
        // Add highlight effect to make them more visible
        res.highlightEffect = true;
        this.drawFuelCanister(res);
      }
    }
  }
  
  drawFuelCanisterExplosion(x: number, y: number, stage: number = 0) {
    this.p.push();
    this.p.translate(x, y);
    
    // Calculate explosion size based on stage (0-1)
    // 0 = beginning of explosion, 1 = end of explosion
    const maxRadius = 40;
    const radius = maxRadius * stage;
    const opacity = 255 * (1 - stage);
    
    // Outer explosion ring
    this.p.noStroke();
    this.p.fill(255, 200, 0, opacity);
    this.p.ellipse(0, 0, radius * 2, radius * 2);
    
    // Inner explosion
    this.p.fill(255, 255, 200, opacity * 0.8);
    this.p.ellipse(0, 0, radius, radius);
    
    // Core
    this.p.fill(255, 255, 255, opacity * 0.6);
    this.p.ellipse(0, 0, radius * 0.5, radius * 0.5);
    
    // Flying debris particles
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * this.p.TWO_PI;
      const distance = radius * 0.6 + (radius * 0.4 * this.p.noise(i, stage * 5));
      const px = Math.cos(angle) * distance;
      const py = Math.sin(angle) * distance;
      
      // Alternating colors for debris
      if (i % 3 === 0) {
        this.p.fill(220, 60, 40, opacity); // Red (canister color)
      } else if (i % 3 === 1) {
        this.p.fill(255, 200, 0, opacity); // Yellow/orange (flame)
      } else {
        this.p.fill(100, 100, 100, opacity); // Gray (metal)
      }
      
      const size = 3 * (1 - stage * 0.7);
      this.p.ellipse(px, py, size, size);
    }
    
    // Shock wave ring
    this.p.noFill();
    this.p.stroke(255, 255, 255, 255 * (0.8 - stage * 0.8));
    this.p.strokeWeight(2);
    this.p.ellipse(0, 0, radius * 2.5, radius * 2.5);
    
    this.p.pop();
  }
}
