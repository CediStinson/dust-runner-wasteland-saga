import p5 from 'p5';
import { GrandpaNPCRenderer } from "../entities/npc/GrandpaNPCRenderer";

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
  grandpaNPC: GrandpaNPCRenderer | null = null;
  grandpaQuote: string = "";
  grandpaQuoteTime: number = 0;

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
    this.grandpaNPC = new GrandpaNPCRenderer(p);
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
    if (this.screenShakeTime > 0) {
      this.p.push();
      this.p.translate(
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount),
        this.p.random(-this.screenShakeAmount, this.screenShakeAmount)
      );
      this.screenShakeTime--;
      
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.drawObstacles();
      this.drawResources();
      this.drawGrandpaNPC();
      
      this.p.pop();
    } else {
      this.drawBackground();
      this.drawTarp();
      this.applyDaytimeTint();
      this.drawObstacles();
      this.drawResources();
      this.drawGrandpaNPC();
    }
  }

  drawGrandpaNPC() {
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    for (let obs of currentObstacles) {
      if (obs.type === "grandpaNPC") {
        this.p.push();
        this.p.translate(obs.x, obs.y);
        if (this.grandpaNPC) this.grandpaNPC.displayGrandpa();
        this.p.pop();

        if (this.grandpaQuote && this.grandpaQuoteTime > 0) {
          this.drawSpeechBubble(obs.x, obs.y - 26, this.grandpaQuote);
        }
      }
    }
    this.updateGrandpaQuoteTime();
  }

  drawSpeechBubble(x: number, y: number, text: string) {
    const p = this.p;
    p.push();
    p.translate(x, y);

    p.stroke(50,50,50,60);
    p.fill(255,255,255,230);
    p.rect(-54, -24, 108, 40, 10);

    p.triangle(0, 20, 8, 34, -8, 34);

    p.fill(40,40,60);
    p.noStroke();

    const maxLineLength = 21;
    let words = text.split(" ");
    let lines: string[] = [];
    let line = "";
    for (let w = 0; w < words.length; w++) {
      if ((line + words[w]).length > maxLineLength) {
        lines.push(line.trim());
        line = "";
      }
      line += words[w] + " ";
    }
    if (line) lines.push(line.trim());

    p.textAlign(p.CENTER, p.TOP);
    p.textSize(13);
    for (let i = 0; i < lines.length; i++) {
      p.text(lines[i], 0, -16 + i*15);
    }

    p.pop();
  }

  setGrandpaQuote(newQuote: string, time: number = 180) {
    this.grandpaQuote = newQuote;
    this.grandpaQuoteTime = time;
  }

  updateGrandpaQuoteTime() {
    if (this.grandpaQuoteTime > 0) {
      this.grandpaQuoteTime--;
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
    this.p.noTint();
    
    if (this.timeOfDay < 0.25) {
      const blendFactor = this.timeOfDay / 0.25;
      const r = this.p.lerp(20, 150, blendFactor);
      const g = this.p.lerp(20, 120, blendFactor);
      const b = this.p.lerp(50, 100, blendFactor);
      const alpha = this.p.lerp(200, 30, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.5) {
      const blendFactor = (this.timeOfDay - 0.25) / 0.25;
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(150, 255, blendFactor);
      const b = this.p.lerp(100, 255, blendFactor);
      const alpha = this.p.lerp(40, 0, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else if (this.timeOfDay < 0.75) {
      const blendFactor = (this.timeOfDay - 0.5) / 0.25;
      const r = this.p.lerp(255, 255, blendFactor);
      const g = this.p.lerp(255, 120, blendFactor);
      const b = this.p.lerp(255, 50, blendFactor);
      const alpha = this.p.lerp(0, 60, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    } else {
      const blendFactor = (this.timeOfDay - 0.75) / 0.25;
      const r = this.p.lerp(255, 20, blendFactor);
      const g = this.p.lerp(120, 20, blendFactor);
      const b = this.p.lerp(50, 50, blendFactor);
      const alpha = this.p.lerp(60, 200, blendFactor);
      
      this.p.fill(r, g, b, alpha);
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
  }

  drawTarp() {
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    let currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'tarp') {
        this.p.push();
        
        this.p.fill(0, 0, 0, 40);
        this.p.noStroke();
        this.p.rect(
          obs.x - obs.width/2 + 10, 
          obs.y - obs.height/2 + 10, 
          obs.width, 
          obs.height
        );
        
        this.p.fill(obs.color.r, obs.color.g, obs.color.b);
        this.p.stroke(0);
        this.p.strokeWeight(2);
        this.p.rect(
          obs.x - obs.width/2, 
          obs.y - obs.height/2, 
          obs.width, 
          obs.height
        );
        
        this.p.stroke(60, 40, 30);
        this.p.strokeWeight(3);
        
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
      }
    }
  }
  
  drawFuelStain(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    const stainColors = [
      { color: this.p.color(0, 0, 0, 20),   size: 1.0 },
      { color: this.p.color(20, 20, 20, 30), size: 0.9 },
      { color: this.p.color(10, 10, 10, 40), size: 0.8 }
    ];
    
    for (let stain of stainColors) {
      this.p.fill(stain.color);
      
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
    
    this.p.noStroke();
    const opacity = obs.opacity || 100;
    this.p.fill(190, 170, 140, opacity);
    
    const spacing = 10;
    const size = obs.size || 1;
    
    for (let i = 0; i < 5; i++) {
      const xOffset = i * spacing * 2;
      
      this.p.ellipse(xOffset, -3, 4 * size, 7 * size);
      
      this.p.ellipse(xOffset + spacing, 3, 4 * size, 7 * size);
    }
    
    this.p.pop();
  }

  drawRock(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);

    this.p.fill(50, 40, 30, 80);
    let shadowOffsetX = 5 * obs.size;
    let shadowOffsetY = 5 * obs.size;
    let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
    let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
    this.p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

    this.p.fill(80, 70, 60);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.beginShape();
    for (let point of obs.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);

    this.p.fill(100, 90, 80);
    this.p.noStroke();
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

    this.p.fill(50, 40, 30, 80);
    this.p.ellipse(8, 8, 50, 40);
    
    this.p.fill(180, 160, 130);
    this.p.ellipse(0, 0, 55, 55);
    
    this.p.fill(210, 180, 140);
    this.p.ellipse(0, 0, 48, 48);
    
    this.p.fill(190, 160, 120);
    this.p.ellipse(0, 0, 40, 40);
    
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
    
    this.p.fill(60, 50, 40);
    this.p.arc(0, 22, 12, 14, -this.p.PI * 0.8, -this.p.PI * 0.2);
    
    this.p.fill(180, 150, 100);
    this.p.ellipse(0, 0, 44, 44);
    this.p.fill(160, 130, 90);
    this.p.ellipse(0, 0, 34, 34);
    this.p.fill(140, 110, 80);
    this.p.ellipse(0, 0, 24, 24);
    this.p.fill(120, 90, 70);
    this.p.ellipse(0, 0, 14, 14);
    
    this.p.fill(80, 60, 50);
    this.p.ellipse(0, 0, 6, 6);
    
    for (let i = 0; i < 3; i++) {
      let t = (this.p.frameCount * 0.01 + i * 0.3) % 1;
      let size = this.p.map(t, 0, 1, 3, 8);
      let alpha = this.p.map(t, 0, 1, 200, 0);
      this.p.fill(200, 200, 200, alpha);
      this.p.ellipse(0, 0 - t * 15, size, size);
    }
    
    this.p.push();
    this.p.translate(16, -10);
    this.p.rotate(this.worldGenerator.getWindmillAngle());
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
    this.p.fill(120, 120, 120);
    this.p.ellipse(0, 0, 4, 4);
    this.p.pop();
    
    this.p.fill(180, 180, 180);
    this.p.ellipse(-12, -10, 8, 8);
    this.p.fill(150, 150, 150);
    this.p.ellipse(-12, -10, 6, 6);
    this.p.stroke(120, 120, 120);
    this.p.strokeWeight(1);
    this.p.line(-12, -10, -16, -13);
    this.p.noStroke();
    
    this.p.fill(160, 120, 100);
    this.p.ellipse(-18, 10, 8, 8);
    this.p.ellipse(-14, 16, 6, 6);
    
    this.p.fill(180, 180, 160);
    this.p.rect(-22, -8, 10, 8, 2);
    
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
    this.p.rotate(this.p.radians(70));
    
    this.p.fill(0, 0, 0, 50);
    this.p.ellipse(8, 8, 55, 35);
    
    this.p.fill(80, 80, 85);
    this.p.rect(-30, -25, 60, 50, 2);
    
    this.p.fill(100, 100, 100, 80);
    this.p.ellipse(-10, 0, 25, 30);
    this.p.fill(90, 90, 90, 60);
    this.p.ellipse(5, 8, 28, 22);
    
    this.p.fill(20, 20, 20, 70);
    this.p.ellipse(0, -5, 20, 15);
    this.p.ellipse(-5, 15, 12, 18);
    
    this.p.fill(120, 80, 60);
    this.p.rect(-18, -12, 16, 20, 1);
    
    this.p.fill(90, 50, 35, 200);
    this.p.rect(-18, -8, 5, 16);
    this.p.fill(100, 60, 40, 150);
    this.p.rect(-12, -12, 8, 5);
    
    this.p.fill(70, 70, 75);
    this.p.beginShape();
    this.p.vertex(-5, -10);
    this.p.vertex(15, -10);
    this.p.vertex(15, -5);
    this.p.vertex(-5, -5);
    this.p.endShape(this.p.CLOSE);
    
    this.p.fill(80, 80, 90);
    this.p.rect(-14, -14, 10, 8, 1);
    this.p.fill(60, 60, 65);
    this.p.ellipse(-9, -10, 8, 8);
    
    this.p.fill(90, 90, 100);
    this.p.rect(-12, -10, 24, 3, 1);
    
    this.p.fill(180, 180, 190);
    this.p.rect(14, -9, 2, 10);
    
    this.p.fill(100, 60, 50);
    this.p.ellipse(15, 0, 10, 8);
    this.p.fill(120, 70, 60);
    this.p.ellipse(15, 0, 6, 5);
    
    this.p.fill(30, 30, 30, 120);
    this.p.ellipse(15, 5, 12, 8);
    
    this.p.stroke(110, 70, 60);
    this.p.strokeWeight(3);
    this.p.line(15, 4, 15, 12);
    this.p.line(15, 12, 25, 12);
    this.p.noStroke();
    
    this.p.fill(60, 60, 65);
    this.p.ellipse(0, 8, 10, 10);
    this.p.fill(80, 80, 85);
    this.p.ellipse(0, 8, 6, 6);
    
    this.p.fill(180, 180, 190);
    this.p.rect(14, -9, 2, 10);
    
    this.p.fill(100, 60, 50);
    this.p.ellipse(15, 0, 10, 8);
    this.p.fill(120, 70, 60);
    this.p.ellipse(15, 0, 6, 5);
    
    this.p.fill(30, 30, 30, 120);
    this.p.ellipse(15, 5, 12, 8);
    
    this.p.stroke(110, 70, 60);
    this.p.strokeWeight(3);
    this.p.line(15, 4, 15, 12);
    this.p.line(15, 12, 25, 12);
    this.p.noStroke();
    
    const blinkRate = Math.sin(this.p.frameCount * 0.05) > 0;
    if (blinkRate) {
      this.p.fill(200, 50, 50, 180);
      this.p.ellipse(-14, -16, 3, 3);
    }

    this.p.push();
    this.p.translate(0, 30);
    
    this.p.fill(70, 70, 75);
    this.p.rect(-10, -5, 20, 15, 2);
    
    this.p.fill(90, 50, 40);
    this.p.rect(-8, -15, 16, 12, 1);
    
    this.p.fill(40, 40, 45);
    this.p.rect(-5, -13, 10, 8, 1);
    
    this.p.fill(180, 60, 40);
    this.p.rect(-8, -8, 4, 5, 1);
    this.p.ellipse(5, -10, 4, 3);
    
    this.p.fill(255, 255, 0, 120);
    this.p.rect(-15, 12, 30, 2);
    this.p.rect(-15, 16, 30, 2);
    
    this.p.fill(70, 70, 75, 100);
    this.p.rect(-20, -5, 40, 25, 3);
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
    
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 16, 10);
    
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
    
    this.p.fill(90, 90, 100);
    this.p.ellipse(-2, 3, 3, 2);
    this.p.ellipse(3, -2, 2, 2);
    
    this.p.pop();
  }

  drawCopper(resource: any) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 14, 10);
    
    this.p.fill(210, 120, 70);
    this.p.beginShape();
    for (let i = 0; i < 7; i++) {
      let angle = i * this.p.TWO_PI / 7 + 0.2;
      let radius = 5 + this.p.noise(i * 0.7) * 3;
      let x = Math.cos(angle) * radius;
      let y = Math.sin(angle) * radius;
      this.p.vertex(x, y);
    }
    this.p.endShape(this.p.CLOSE);
    
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
    
    this.p.fill(100, 180, 120, 180);
    this.p.ellipse(-1, 2, 3, 2);
    this.p.ellipse(2, -1, 2, 1.5);
    this.p.ellipse(-2, -2, 1.5, 1.5);
    
    this.p.pop();
  }

  drawHealth(resource: any) {
    this.p.push();
    this.p.translate(resource.x, resource.y);
    
    this.p.fill(50, 40, 30, 50);
    this.p.ellipse(2, 2, 15, 10);
    
    this.p.fill(220, 220, 220);
    this.p.rect(-6, -5, 12, 10, 2);
    
    this.p.fill(200, 50, 50);
    this.p.rect(-4, -1, 8, 2);
    this.p.rect(-1, -4, 2, 8);
    
    this.p.fill(240, 240, 240);
    this.p.rect(-5, -4, 10, 1);
    
    this.p.fill(150, 150, 150);
    this.p.rect(-1, 3, 2, 1);
    
    let pulseSize = 1 + Math.sin(this.p.frameCount * 0.1) * 0.2;
    this.p.noFill();
    this.p.stroke(200, 50, 50, 100 - Math.abs(Math.sin(this.p.frameCount * 0.1) * 100));
    this.p.strokeWeight(1);
    this.p.ellipse(0, 0, 15 * pulseSize, 13 * pulseSize);
    this.p.noStroke();
    
    this.p.pop();
  }

  drawFuelCanisters() {
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    const currentObstacles = this.worldGenerator.getObstacles()[currentAreaKey] || [];
    
    const currentResources = this.worldGenerator.getResources()[currentAreaKey] || [];
    
    for (const obstacle of currentObstacles) {
      if (obstacle.type === 'fuelCanister' && !obstacle.collected) {
        this.drawFuelCanister(obstacle);
      }
    }
    
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
    
    this.p.fill(0, 0, 0, 50);
    this.p.noStroke();
    this.p.ellipse(2, 2, 10, 6);
    
    this.p.fill(190, 45, 45);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.rect(-4, -5, 8, 10, 1);
    
    this.p.stroke(120, 30, 30);
    this.p.strokeWeight(0.5);
    this.p.line(-3, -3, -1, -1);
    this.p.line(1, 2, 3, 4);
    this.p.line(-2, 3, 0, 3);
    
    this.p.noStroke();
    this.p.fill(130, 70, 40, 180);
    this.p.ellipse(-2, 2, 2, 1);
    this.p.ellipse(3, -2, 1.5, 1);
    this.p.ellipse(0, 0, 1, 2);
    
    this.p.fill(80, 60, 40, 120);
    this.p.rect(2, -3, 1, 5, 0.5);
    this.p.rect(-3, 0, 4, 1, 0.5);
    
    this.p.fill(220, 170, 170, 100);
    this.p.rect(-3, -4, 2, 1, 0.5);
    this.p.rect(2, 2, 1, 2, 0.5);
    
    this.p.fill(40);
    this.p.stroke(0);
    this.p.strokeWeight(1);
    this.p.rect(-2, -7, 4, 2);
    
    this.p.stroke(100);
    this.p.strokeWeight(0.5);
    this.p.line(-1, -6.5, 1, -6.5);
    
    this.p.fill(80, 80, 90);
    this.p.stroke(1);
    this.p.strokeWeight(1);
    this.p.line(-3, -5, 3, -5);
    
    this.p.fill(150, 150, 150, 180);
    this.p.rect(3, -4, 0.5, 7);
    
    this.p.fill(240, 220, 0, 100);
    this.p.rect(-3.5, -2, 2, 0.5);
    this.p.rect(-3.5, -1, 2, 0.5);
    
    const pulseSize = 1 + Math.sin(this.p.frameCount * 0.05) * 0.1;
    this.p.noFill();
    this.p.stroke(255, 200, 0, 40 + Math.abs(Math.sin(this.p.frameCount * 0.05) * 20));
    this.p.strokeWeight(0.8);
    this.p.ellipse(0, 0, 14 * pulseSize, 16 * pulseSize);
    this.p.noStroke();
    
    this.p.pop();
  }
}
