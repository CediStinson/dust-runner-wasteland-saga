import { useEffect, useRef } from 'react';
import p5 from 'p5';

declare global {
  interface String {
    hashCode(): number;
  }
}

interface PlayerType {
  x: number;
  y: number;
  velX: number;
  velY: number;
  speed: number;
  inventory: { [key: string]: number };
  angle: number;
  update: () => void;
  handleInput: () => void;
  applyFriction: () => void;
  display: () => void;
  collectResource: () => void;
}

interface HoverbikeType {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  speed: number;
  speedLevel: number;
  durabilityLevel: number;
  collisionCooldown: number;
  update: () => void;
  handleControls: () => void;
  applyMovement: () => void;
  checkCollisions: () => void;
  display: () => void;
  upgradeSpeed: () => void;
  upgradeDurability: () => void;
}

const GameSketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!sketchRef.current) return;
    
    const sketch = (p: any) => {
      let player: PlayerType;
      let hoverbike: HoverbikeType;
      let worldX = 0;
      let worldY = 0;
      let riding = false;
      let obstacles: Record<string, any[]> = {};
      let resources: Record<string, any[]> = {};
      let sandTextures: Record<string, any> = {};
      let grassTextures: Record<string, any> = {};
      let generatedAreas = new Set<string>();
      let windmillAngle = 0;

      class Player implements PlayerType {
        x: number;
        y: number;
        velX: number;
        velY: number;
        speed: number;
        inventory: { [key: string]: number };
        angle: number;

        constructor(x: number, y: number) {
          this.x = x;
          this.y = y;
          this.velX = 0;
          this.velY = 0;
          this.speed = 0.5;
          this.inventory = { metal: 0 };
          this.angle = 0;
        }

        update() {
          if (!riding) {
            this.handleInput();
            this.applyFriction();
            this.x += this.velX;
            this.y += this.velY;
            this.collectResource();
          } else {
            this.x = hoverbike.x;
            this.y = hoverbike.y;
          }
        }

        handleInput() {
          let moveX = 0, moveY = 0;
          if (p.keyIsDown(p.UP_ARROW)) moveY -= this.speed;
          if (p.keyIsDown(p.DOWN_ARROW)) moveY += this.speed;
          if (p.keyIsDown(p.LEFT_ARROW)) moveX -= this.speed;
          if (p.keyIsDown(p.RIGHT_ARROW)) moveX += this.speed;

          let magnitude = p.sqrt(moveX * moveX + moveY * moveY);
          if (magnitude > 0) {
            moveX /= magnitude;
            moveY /= magnitude;
            this.angle = p.atan2(moveY, moveX);
          }

          this.velX += moveX * this.speed * 0.2;
          this.velY += moveY * this.speed * 0.2;
        }

        applyFriction() {
          this.velX *= 0.9;
          this.velY *= 0.9;
        }

        display() {
          if (!riding) {
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle + p.PI / 2);
            p.fill(120, 100, 80);
            p.beginShape();
            p.vertex(-8, -10);
            p.vertex(-6, -4);
            p.vertex(-10, 2);
            p.vertex(-4, 8);
            p.vertex(4, 8);
            p.vertex(10, 2);
            p.vertex(6, -4);
            p.vertex(8, -10);
            p.endShape(p.CLOSE);
            p.fill(150, 130, 110);
            p.ellipse(-4, 2, 4, 3);
            p.ellipse(4, 2, 4, 3);
            p.fill(100, 80, 60);
            p.ellipse(-6, 0, 3, 2);
            p.ellipse(6, 0, 3, 2);
            p.fill(80, 60, 40);
            p.ellipse(0, -6, 8, 6);
            p.fill(60, 40, 20);
            p.ellipse(0, -5, 6, 4);
            p.fill(200, 180, 150);
            p.ellipse(0, -5, 4, 2);
            p.fill(50, 50, 50);
            p.ellipse(-1, -5, 2, 1);
            p.ellipse(1, -5, 2, 1);
            p.fill(80, 60, 40, 100);
            p.ellipse(0, 6, 12, 4);
            p.pop();
          }
        }

        collectResource() {
          let currentResources = resources[`${worldX},${worldY}`] || [];
          for (let i = currentResources.length - 1; i >= 0; i--) {
            let res = currentResources[i];
            if (p.dist(this.x, this.y, res.x, res.y) < 20) {
              this.inventory[res.type]++;
              currentResources.splice(i, 1);
            }
          }
        }
      }

      class Hoverbike implements HoverbikeType {
        x: number;
        y: number;
        worldX: number;
        worldY: number;
        angle: number;
        velocityX: number;
        velocityY: number;
        health: number;
        maxHealth: number;
        speed: number;
        speedLevel: number;
        durabilityLevel: number;
        collisionCooldown: number;

        constructor(x: number, y: number) {
          this.x = x;
          this.y = y;
          this.worldX = worldX;
          this.worldY = worldY;
          this.angle = 0;
          this.velocityX = 0;
          this.velocityY = 0;
          this.health = 100;
          this.maxHealth = 100;
          this.speed = 2;
          this.speedLevel = 0;
          this.durabilityLevel = 0;
          this.collisionCooldown = 0;
        }

        update() {
          if (riding) {
            this.handleControls();
            this.applyMovement();
            this.checkCollisions();
            if (this.collisionCooldown > 0) {
              this.collisionCooldown--;
            }
          }
        }

        handleControls() {
          let acceleration = 0;
          if (p.keyIsDown(p.UP_ARROW)) acceleration = 0.1;
          else if (p.keyIsDown(p.DOWN_ARROW)) acceleration = -0.1;

          let turningVelocity = 0;
          if (p.keyIsDown(p.LEFT_ARROW)) turningVelocity = -0.03;
          else if (p.keyIsDown(p.RIGHT_ARROW)) turningVelocity = 0.03;

          this.angle += turningVelocity;
          this.velocityX += p.cos(this.angle) * acceleration;
          this.velocityY += p.sin(this.angle) * acceleration;
          this.velocityX *= 0.95;
          this.velocityY *= 0.95;
        }

        applyMovement() {
          this.x += this.velocityX;
          this.y += this.velocityY;
        }

        checkCollisions() {
          if (this.collisionCooldown > 0) return;

          let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
          for (let obs of currentObstacles) {
            if (obs.type === 'rock') {
              let dx = this.x - obs.x;
              let dy = this.y - obs.y;
              let hitboxWidth = 30 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
              let hitboxHeight = 30 * obs.size * (obs.aspectRatio < 1 ? 1 / p.abs(obs.aspectRatio) : 1);
              let normalizedX = dx / hitboxWidth;
              let normalizedY = dy / hitboxHeight;
              let distance = p.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

              if (distance < 1) {
                this.health = p.max(0, this.health - 10);
                this.velocityX = -this.velocityX * 0.5;
                this.velocityY = -this.velocityY * 0.5;
                this.collisionCooldown = 30;
                let pushDistance = (1 - distance) * 30;
                let pushX = normalizedX * pushDistance;
                let pushY = normalizedY * pushDistance;
                this.x += pushX * hitboxWidth / 30;
                this.y += pushY * hitboxHeight / 30;
                break;
              }
            } else if (obs.type === 'cactus') {
              let dx = this.x - obs.x;
              let dy = this.y - obs.y;
              let hitboxWidth = 20 * obs.size;
              let hitboxHeight = 20 * obs.size;
              let distance = p.sqrt(dx * dx + dy * dy);

              if (distance < hitboxWidth) {
                this.health = p.max(0, this.health - 3);
                this.velocityX *= 0.8;
                this.velocityY *= 0.8;
                this.collisionCooldown = 20;
                let pushDistance = (hitboxWidth - distance);
                let pushX = (dx / distance) * pushDistance;
                let pushY = (dy / distance) * pushDistance;
                this.x += pushX;
                this.y += pushY;
                break;
              }
            }
          }
        }

        display() {
          if (this.worldX === worldX && this.worldY === worldY) {
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);
            p.fill(80, 80, 90);
            p.beginShape();
            p.vertex(-8, -15);
            p.vertex(-12, -5);
            p.vertex(-10, 5);
            p.vertex(-5, 15);
            p.vertex(5, 15);
            p.vertex(10, 5);
            p.vertex(12, -5);
            p.endShape(p.CLOSE);
            p.fill(60, 60, 70);
            p.beginShape();
            p.vertex(-5, -5);
            p.vertex(5, -5);
            p.vertex(5, 5);
            p.vertex(-5, 5);
            p.endShape(p.CLOSE);
            p.fill(100, 100, 110);
            p.beginShape();
            p.vertex(-4, 15);
            p.vertex(4, 15);
            p.vertex(3, 20);
            p.vertex(-3, 20);
            p.endShape(p.CLOSE);
            p.fill(255, 150, 50, 200);
            p.ellipse(0, 22, 6, 3);
            p.fill(255, 200, 100, 150);
            p.ellipse(0, 22, 3, 1.5);
            p.fill(120, 120, 130);
            p.ellipse(-8, 0, 4, 4);
            p.ellipse(8, 0, 4, 4);
            p.stroke(50, 50, 60);
            p.strokeWeight(1);
            p.line(-5, -5, -5, 5);
            p.line(5, -5, 5, 5);
            p.noStroke();
            p.fill(50, 50, 60, 100);
            p.ellipse(0, 18, 20, 5);
            p.pop();
          }
        }

        upgradeSpeed() {
          if (this.speedLevel < 3) {
            this.speedLevel++;
            this.speed += 0.5;
          }
        }

        upgradeDurability() {
          if (this.durabilityLevel < 3) {
            this.durabilityLevel++;
            this.maxHealth += 50;
            this.health += 50;
          }
        }
      }

      function generateRockShape(size, aspectRatio) {
        let shape = [];
        let numPoints = p.floor(p.random(8, 12));
        let baseRadius = p.random(20, 30) * size;
        let noiseScale = p.random(0.3, 0.7);
        p.noiseSeed(p.random(1000));

        for (let i = 0; i < numPoints; i++) {
          let angle = p.map(i, 0, numPoints, 0, p.TWO_PI);
          let radius = baseRadius + p.noise(angle * noiseScale) * 8 - 4;
          let x = p.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1) + p.random(-3, 3);
          let y = p.sin(angle) * radius * (aspectRatio < 1 ? 1 / p.abs(aspectRatio) : 1) + p.random(-3, 3);
          shape.push({ x, y });
        }
        return shape;
      }

      function generateBushShape(size) {
        let shape = [];
        let numPoints = p.floor(p.random(8, 12));
        let baseRadius = p.random(10, 15) * size;
        p.noiseSeed(p.random(1000));

        for (let i = 0; i < numPoints; i++) {
          let angle = p.map(i, 0, numPoints, 0, p.TWO_PI);
          let radius = baseRadius + p.noise(angle * 0.5) * 8 - 4;
          let x = p.cos(angle) * radius + p.random(-3, 3);
          let y = p.sin(angle) * radius + p.random(-3, 3);
          shape.push({ x, y });
        }
        return shape;
      }

      function generateCactusShape(size, zoneKey, index) {
        let shape = [];
        p.noiseSeed(zoneKey.hashCode() + index);
        let baseHeight = 25 * size;
        let baseWidth = 6 * size;

        let bodyPoints = [];
        for (let i = 0; i < 8; i++) {
          let t = i / 7;
          let x = p.lerp(-baseWidth, baseWidth, t);
          let y = p.lerp(0, -baseHeight, t);
          x += p.noise(t * 2) * 1 - 0.5;
          bodyPoints.push({ x, y });
        }
        shape.push({ type: 'body', points: bodyPoints });

        let armHeight = baseHeight * 0.5;
        let armWidth = baseWidth * 0.6;
        let leftArmPoints = [];
        for (let j = 0; j < 6; j++) {
          let t = j / 5;
          let x = p.lerp(-baseWidth, -baseWidth - armWidth, t);
          let y = p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
          x += p.noise(t * 2 + 10) * 0.5 - 0.25;
          leftArmPoints.push({ x, y });
        }
        shape.push({ type: 'arm', points: leftArmPoints });

        let rightArmPoints = [];
        for (let j = 0; j < 6; j++) {
          let t = j / 5;
          let x = p.lerp(baseWidth, baseWidth + armWidth, t);
          let y = p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
          x += p.noise(t * 2 + 20) * 0.5 - 0.25;
          rightArmPoints.push({ x, y });
        }
        shape.push({ type: 'arm', points: rightArmPoints });

        return shape;
      }

      function generateSandTexture(zoneKey) {
        let texture = p.createGraphics(p.width, p.height);
        texture.noSmooth();
        texture.noStroke();
        p.noiseSeed(zoneKey.hashCode());
        for (let i = 0; i < p.width; i += 4) {
          for (let j = 0; j < p.height; j += 4) {
            let noiseVal = p.noise(i * 0.01, j * 0.01);
            let r = p.map(noiseVal, 0, 1, 220, 255);
            let g = p.map(noiseVal, 0, 1, 180, 200);
            let b = p.map(noiseVal, 0, 1, 100, 120);
            texture.fill(r, g, b);
            texture.rect(i, j, 4, 4);
            if (noiseVal > 0.6) {
              texture.fill(r - 20, g - 20, b - 20);
              texture.rect(i + 1, j + 1, 2, 2);
            }
          }
        }
        sandTextures[zoneKey] = texture;
      }

      function generateBurntGrassTexture(zoneKey) {
        let texture = p.createGraphics(p.width, p.height);
        texture.noSmooth();
        texture.noStroke();
        p.noiseSeed(zoneKey.hashCode() + 1);
        for (let i = 0; i < p.width; i += 4) {
          for (let j = 0; j < p.height; j += 4) {
            let noiseVal = p.noise(i * 0.02, j * 0.02);
            if (noiseVal > 0.55) {
              let density = p.map(noiseVal, 0.55, 1, 0, 0.8);
              if (p.random() < density) {
                let colorVariation = p.random(-8, 8);
                let r = 180 + colorVariation;
                let g = 150 + colorVariation;
                let b = 80 + colorVariation;
                texture.fill(r, g, b, 220);
                let height = p.random(2, 5);
                let lean = p.random(-0.3, 0.3);
                texture.beginShape();
                texture.vertex(i, j);
                texture.vertex(i + lean, j - height);
                texture.vertex(i + 0.7, j);
                texture.endShape(p.CLOSE);
                p.fill(r + 15, g + 15, b + 15, 220);
                texture.beginShape();
                texture.vertex(i, j);
                texture.vertex(i + lean * 0.7, j - height * 0.7);
                texture.vertex(i + 0.5, j);
                texture.endShape(p.CLOSE);
              }
            }
          }
        }
        grassTextures[zoneKey] = texture;
      }

      function generateNewArea(x, y) {
        let zoneKey = `${x},${y}`;
        if (!generatedAreas.has(zoneKey)) {
          if (!sandTextures[zoneKey]) {
            generateSandTexture(zoneKey);
          }
          if (!grassTextures[zoneKey]) {
            generateBurntGrassTexture(zoneKey);
          }
          let areaObstacles = [];
          if (x === 0 && y === 0) {
            areaObstacles.push({ x: p.width / 2, y: p.height / 2 - 100, type: 'hut' });
            for (let i = 0; i < 5; i++) {
              let size = p.random(0.3, 2.0);
              let aspectRatio = p.random(0.5, 2.0);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'rock', 
                shape: generateRockShape(size, aspectRatio),
                size: size,
                aspectRatio: aspectRatio
              });
            }
            for (let i = 0; i < 3; i++) {
              let size = p.random(0.5, 1.0);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'bush', 
                shape: generateBushShape(size),
                size: size
              });
            }
            for (let i = 0; i < 2; i++) {
              let size = p.random(0.5, 1.2);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'cactus', 
                shape: generateCactusShape(size, zoneKey, i),
                size: size
              });
            }
          } else {
            for (let i = 0; i < 10; i++) {
              let size = p.random(0.3, 2.0);
              let aspectRatio = p.random(0.5, 2.0);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'rock', 
                shape: generateRockShape(size, aspectRatio),
                size: size,
                aspectRatio: aspectRatio
              });
            }
            for (let i = 0; i < 5; i++) {
              let size = p.random(0.5, 1.0);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'bush', 
                shape: generateBushShape(size),
                size: size
              });
            }
            for (let i = 0; i < 3; i++) {
              let size = p.random(0.5, 1.2);
              areaObstacles.push({ 
                x: p.random(p.width), 
                y: p.random(p.height), 
                type: 'cactus', 
                shape: generateCactusShape(size, zoneKey, i),
                size: size
              });
            }
          }
          obstacles[zoneKey] = areaObstacles;
          generateResources(x, y);
          generatedAreas.add(zoneKey);
        }
      }

      function generateResources(x, y) {
        let areaResources = [];
        for (let i = 0; i < 5; i++) {
          areaResources.push({ x: p.random(p.width), y: p.random(p.height), type: 'metal' });
        }
        resources[`${x},${y}`] = areaResources;
      }

      function handleObstacles() {
        let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
        for (let obs of currentObstacles) {
          if (obs.type === 'rock') {
            p.push();
            p.translate(obs.x, obs.y);

            p.fill(50, 40, 30, 80);
            let shadowOffsetX = 5 * obs.size;
            let shadowOffsetY = 5 * obs.size;
            let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
            let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / p.abs(obs.aspectRatio) : 1);
            p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

            p.fill(80, 70, 60);
            p.beginShape();
            for (let point of obs.shape) {
              p.vertex(point.x, point.y);
            }
            p.endShape(p.CLOSE);

            p.fill(100, 90, 80);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = 2 * obs.size;
              let offsetY = 2 * obs.size;
              p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
            }
            p.endShape(p.CLOSE);

            p.fill(120, 110, 100);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = -2 * obs.size;
              let offsetY = -2 * obs.size;
              p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
            }
            p.endShape(p.CLOSE);

            p.fill(60, 50, 40);
            p.ellipse(-4 * obs.size, -2 * obs.size, 3 * obs.size, 1 * obs.size);
            p.ellipse(2 * obs.size, 3 * obs.size, 1 * obs.size, 3 * obs.size);
            p.fill(130, 120, 110);
            p.ellipse(-2 * obs.size, 4 * obs.size, 2 * obs.size, 2 * obs.size);
            p.ellipse(3 * obs.size, -3 * obs.size, 2 * obs.size, 2 * obs.size);
            p.ellipse(-5 * obs.size, 0 * obs.size, 1 * obs.size, 1 * obs.size);
            p.ellipse(0 * obs.size, 5 * obs.size, 1 * obs.size, 1 * obs.size);

            p.pop();
          } else if (obs.type === 'hut') {
            p.push();
            p.translate(obs.x, obs.y);

            p.fill(50, 40, 30, 80);
            p.ellipse(5, 5, 40, 30);

            p.fill(210, 180, 140);
            p.beginShape();
            p.vertex(-20, -15);
            p.vertex(-15, -20);
            p.vertex(15, -20);
            p.vertex(20, -15);
            p.vertex(20, 15);
            p.vertex(-20, 15);
            p.endShape(p.CLOSE);

            p.fill(90, 70, 50);
            p.beginShape();
            p.vertex(-15, -20);
            p.vertex(-10, -25);
            p.vertex(10, -25);
            p.vertex(15, -20);
            p.endShape(p.CLOSE);
            p.stroke(70, 50, 30);
            p.strokeWeight(1);
            p.line(-12, -22, -8, -24);
            p.line(5, -23, 10, -22);
            p.noStroke();

            p.fill(120, 120, 120);
            p.beginShape();
            p.vertex(-20, 5);
            p.vertex(-15, 0);
            p.vertex(-10, 5);
            p.endShape(p.CLOSE);
            p.beginShape();
            p.vertex(10, 0);
            p.vertex(15, 5);
            p.vertex(20, 0);
            p.endShape(p.CLOSE);
            p.fill(150, 80, 40);
            p.ellipse(-15, 2, 3, 2);
            p.ellipse(15, 2, 2, 3);

            p.push();
            p.translate(0, -25);
            p.rotate(windmillAngle);
            p.fill(100, 80, 60);
            for (let i = 0; i < 4; i++) {
              p.push();
              p.rotate(i * p.PI / 2);
              p.beginShape();
              p.vertex(0, 0);
              p.vertex(2, -10);
              p.vertex(-2, -10);
              p.endShape(p.CLOSE);
              p.pop();
            }
            p.fill(120, 120, 120);
            p.ellipse(0, 0, 4, 4);
            p.pop();

            p.pop();
          } else if (obs.type === 'bush') {
            p.push();
            p.translate(obs.x, obs.y);

            p.fill(180, 150, 100, 50);
            let shadowOffsetX = 2 * obs.size;
            let shadowOffsetY = 2 * obs.size;
            let shadowWidth = 10 * obs.size;
            let shadowHeight = 10 * obs.size;
            p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

            p.fill(50, 70, 30);
            p.beginShape();
            for (let point of obs.shape) {
              p.vertex(point.x, point.y);
            }
            p.endShape(p.CLOSE);

            p.fill(70, 90, 50);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = 1 * obs.size;
              let offsetY = 1 * obs.size;
              p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
            }
            p.endShape(p.CLOSE);

            p.fill(90, 110, 70);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = -1 * obs.size;
              let offsetY = -1 * obs.size;
              p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
            }
            p.endShape(p.CLOSE);

            p.fill(40, 60, 20);
            p.ellipse(-3 * obs.size, -2 * obs.size, 2 * obs.size, 1 * obs.size);
            p.ellipse(2 * obs.size, 1 * obs.size, 1 * obs.size, 2 * obs.size);
            p.fill(100, 120, 80);
            p.ellipse(-1 * obs.size, 2 * obs.size, 1 * obs.size, 1 * obs.size);
            p.stroke(70, 50, 30);
            p.strokeWeight(1 * obs.size);
            p.line(0, 0, -5 * obs.size, -3 * obs.size);
            p.line(0, 0, 4 * obs.size, -2 * obs.size);
            p.noStroke();
            p.pop();
          } else if (obs.type === 'cactus') {
            p.push();
            p.translate(obs.x, obs.y);

            p.fill(180, 150, 100, 50);
            let shadowOffsetX = 2 * obs.size;
            let shadowOffsetY = 2 * obs.size;
            let shadowWidth = 8 * obs.size;
            let shadowHeight = 10 * obs.size;
            p.beginShape();
            for (let i = 0; i < 8; i++) {
              let angle = p.map(i, 0, 8, 0, p.TWO_PI);
              let radiusX = shadowWidth * (0.8 + p.noise(angle * 0.5) * 0.4);
              let radiusY = shadowHeight * (0.8 + p.noise(angle * 0.5 + 10) * 0.4);
              let x = shadowOffsetX + p.cos(angle) * radiusX;
              let y = shadowOffsetY + p.sin(angle) * radiusY;
              p.vertex(x, y);
            }
            p.endShape(p.CLOSE);

            for (let part of obs.shape) {
              p.fill(40, 80, 40);
              p.beginShape();
              for (let point of part.points) {
                p.vertex(point.x, point.y);
              }
              p.endShape(p.CLOSE);

              p.fill(60, 100, 60);
              p.beginShape();
              for (let i = 0; i < part.points.length; i++) {
                let point = part.points[i];
                let offsetX = -1 * obs.size;
                let offsetY = -1 * obs.size;
                p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
              }
              p.endShape(p.CLOSE);

              p.fill(50, 90, 50);
              for (let i = 0; i < part.points.length - 1; i += 2) {
                let p1 = part.points[i];
                let p2 = part.points[i + 1];
                p.ellipse((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 2 * obs.size, 2 * obs.size);
              }
            }

            p.fill(200, 200, 150);
            for (let part of obs.shape) {
              if (part.type === 'body') {
                for (let i = 0; i < 5; i++) {
                  let t = i / 4;
                  let p1 = part.points[0];
                  let p2 = part.points[part.points.length - 1];
                  let x = p.lerp(p1.x, p2.x, t);
                  let y = p.lerp(p1.y, p2.y, t);
                  p.ellipse(x - 3 * obs.size, y, 1 * obs.size, 1 * obs.size);
                  p.ellipse(x + 3 * obs.size, y, 1 * obs.size, 1 * obs.size);
                }
              } else if (part.type === 'arm') {
                for (let i = 0; i < 3; i++) {
                  let t = i / 2;
                  let p1 = part.points[0];
                  let p2 = part.points[part.points.length - 1];
                  let x = p.lerp(p1.x, p2.x, t);
                  let y = p.lerp(p1.y, p2.y, t);
                  p.ellipse(x, y - 2 * obs.size, 1 * obs.size, 1 * obs.size);
                }
              }
            }
            p.pop();
          }
        }
      }

      function handleResources() {
        let currentResources = resources[`${worldX},${worldY}`] || [];
        for (let res of currentResources) {
          p.push();
          p.translate(res.x, res.y);
          p.fill(130, 130, 130);
          p.beginShape();
          for (let angle = 0; angle < p.TWO_PI; angle += p.PI / 6) {
            let radius = 6 + p.noise(angle) * 2;
            let x = p.cos(angle) * radius;
            let y = p.sin(angle) * radius;
            p.vertex(x, y);
          }
          p.endShape(p.CLOSE);
          p.fill(160, 160, 160);
          p.beginShape();
          for (let angle = 0; angle < p.TWO_PI; angle += p.PI / 6) {
            let radius = 4 + p.noise(angle) * 1.5;
            let x = p.cos(angle) * radius;
            let y = p.sin(angle) * radius;
            p.vertex(x, y);
          }
          p.endShape(p.CLOSE);
          p.fill(100, 100, 100);
          p.ellipse(0, 0, 4, 4);
          p.fill(80, 60, 40);
          p.ellipse(-2, 2, 2, 1);
          p.ellipse(2, -1, 1, 2);
          p.fill(80, 80, 80, 100);
          p.ellipse(0, 2, 8, 2);
          p.pop();
        }
      }

      function checkBorder() {
        if (player.x > p.width) {
          worldX++;
          player.x = 0;
          if (riding) {
            hoverbike.x = player.x;
            hoverbike.worldX = worldX;
          }
          generateNewArea(worldX, worldY);
        } else if (player.x < 0) {
          worldX--;
          player.x = p.width;
          if (riding) {
            hoverbike.x = player.x;
            hoverbike.worldX = worldX;
          }
          generateNewArea(worldX, worldY);
        }
        if (player.y > p.height) {
          worldY++;
          player.y = 0;
          if (riding) {
            hoverbike.y = player.y;
            hoverbike.worldY = worldY;
          }
          generateNewArea(worldX, worldY);
        } else if (player.y < 0) {
          worldY--;
          player.y = p.height;
          if (riding) {
            hoverbike.y = player.y;
            hoverbike.worldY = worldY;
          }
          generateNewArea(worldX, worldY);
        }
      }

      function drawHealthBar() {
        if (hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          let barWidth = 40;
          let barHeight = 5;
          let healthRatio = hoverbike.health / hoverbike.maxHealth;
          healthRatio = p.constrain(healthRatio, 0, 1);

          p.fill(80, 0, 0);
          p.beginShape();
          p.vertex(hoverbike.x - barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x + barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x + barWidth / 2 + 2, hoverbike.y - 20 + barHeight);
          p.vertex(hoverbike.x - barWidth / 2 - 2, hoverbike.y - 20 + barHeight);
          p.endShape(p.CLOSE);

          p.fill(100, 20, 20);
          p.ellipse(hoverbike.x - barWidth / 2 + 5, hoverbike.y - 20 + barHeight / 2, 3, 3);
          p.ellipse(hoverbike.x + barWidth / 2 - 5, hoverbike.y - 20 + barHeight / 2, 3, 3);

          p.fill(0, 80, 0);
          let healthWidth = barWidth * healthRatio;
          p.beginShape();
          p.vertex(hoverbike.x - barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x - barWidth / 2 + healthWidth, hoverbike.y - 20);
          p.vertex(hoverbike.x - barWidth / 2 + healthWidth + 2, hoverbike.y - 20 + barHeight);
          p.vertex(hoverbike.x - barWidth / 2 - 2, hoverbike.y - 20 + barHeight);
          p.endShape(p.CLOSE);

          p.fill(0, 100, 0);
          p.ellipse(hoverbike.x - barWidth / 2 + healthWidth / 2, hoverbike.y - 20 + barHeight / 2, 4, 2);
        }
      }

      function drawInstructions() {
        p.fill(255);
        p.textSize(16);
        p.text("Use arrow keys to move.", 10, 30);
        p.text("Press 'f' to mount/dismount hoverbike.", 10, 50);
        p.text("Press 'r' to repair hoverbike with metal.", 10, 70);
        p.text("Press 's' to upgrade speed with metal.", 10, 90);
        p.text("Press 'd' to upgrade durability with metal.", 10, 110);
        
        p.text("Metal: " + player.inventory.metal, 10, 130);
        
        p.text("Zone: " + worldX + "," + worldY, 10, 150);
      }

      String.prototype.hashCode = function() {
        let hash = 0;
        for (let i = 0; i < this.length; i++) {
          let char = this.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        return hash;
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noSmooth();
        player = new Player(p.width / 2, p.height / 2 - 50);
        hoverbike = new Hoverbike(p.width / 2, p.height / 2);
        worldX = 0;
        worldY = 0;
        generateNewArea(0, 0);
        generatedAreas.add(`${worldX},${worldY}`);
      };

      p.draw = () => {
        let zoneKey = `${worldX},${worldY}`;
        if (sandTextures[zoneKey]) {
          p.image(sandTextures[zoneKey], 0, 0);
        }
        if (grassTextures[zoneKey]) {
          p.image(grassTextures[zoneKey], 0, 0);
        }
        handleObstacles();
        handleResources();
        if (hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          hoverbike.update();
          hoverbike.display();
        }
        player.update();
        player.display();
        checkBorder();
        drawHealthBar();
        drawInstructions();
        windmillAngle += 0.05;
      };

      p.keyPressed = () => {
        if (p.key === 'f' || p.key === 'F') {
          if (riding) {
            riding = false;
          } else if (p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
                    hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
            riding = true;
          }
        }
        if (p.key === 'r' && !riding && p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
            hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          if (player.inventory.metal >= 1 && hoverbike.health < hoverbike.maxHealth) {
            player.inventory.metal--;
            hoverbike.health = p.min(hoverbike.health + 20, hoverbike.maxHealth);
          }
        }
        if (p.key === 's' && !riding && p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
            hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          if (player.inventory.metal >= 5) {
            player.inventory.metal -= 5;
            hoverbike.upgradeSpeed();
          }
        }
        if (p.key === 'd' && !riding && p.dist(player.x, player.y, hoverbike.x, hoverbike.y) < 30 && 
            hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          if (player.inventory.metal >= 5) {
            player.inventory.metal -= 5;
            hoverbike.upgradeDurability();
          }
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        sandTextures = {};
        grassTextures = {};
        generateNewArea(worldX, worldY);
      };
    };

    const myP5 = new p5(sketch, sketchRef.current);

    return () => {
      myP5.remove();
    };
  }, [sketchRef]);

  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
