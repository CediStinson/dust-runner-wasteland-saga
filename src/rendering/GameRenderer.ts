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
        // DRAW GRANDPA if at home and grandpa is "active"
        if (this.worldX === 0 && this.worldY === 0 && typeof window !== "undefined" && window.__showGrandpaNPC) {
          // Draw in front of hut -- coordinates based on hut position
          this.p.push();
          // The hut is at obs.x, obs.y. Place grandpa just "in front"
          this.p.translate(obs.x, obs.y + 40);
          this.p.scale(1.2, 1.2);
          // Grandpa NPC params from window vars set from GameCore
          const npcParams = window.__grandpaNPCParams || {};
          // Use our PlayerRenderer if available
          if (this.player && this.player.playerRenderer && this.player.playerRenderer.displayGrandpaNPC) {
            this.player.playerRenderer.displayGrandpaNPC(
              Math.sin(this.p.frameCount * 0.03) * 1.5, // idle arm anim
              npcParams.quote || "",
              npcParams.showSpeechBubble
            );
          }
          this.p.pop();
        }
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
