
import { useEffect, useRef } from 'react';
import p5 from 'p5';

const GameSketch = () => {
  const sketchRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Only create sketch if p5 is loaded and container exists
    if (!sketchRef.current) return;
    
    const sketch = (p: any) => {
      // Global variables
      let player;
      let hoverbike;
      let worldX = 0;
      let worldY = 0;
      let riding = false;
      let obstacles = {};
      let resources = {};
      let sandTextures = {};
      let grassTextures = {};
      let generatedAreas = new Set(); // Track generated areas
      let windmillAngle = 0; // For animating the windmill

      // Player class
      class Player {
        constructor(x, y) {
          this.x = x;
          this.y = y;
          this.velX = 0;
          this.velY = 0;
          this.speed = 0.5;
          this.inventory = { metal: 0 };
          this.angle = 0; // Track the player's facing direction
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
            // Update the player's facing angle based on movement direction
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
            // Enhanced player sprite (desert survivor)
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle + p.PI / 2); // Adjust angle so the top of the sprite faces the direction
            // Cloak (irregular shape with more detail)
            p.fill(120, 100, 80); // Dusty gray-brown cloak
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
            // Cloak details (tattered edges and folds)
            p.fill(150, 130, 110); // Lighter highlights
            p.ellipse(-4, 2, 4, 3);
            p.ellipse(4, 2, 4, 3);
            p.fill(100, 80, 60); // Darker folds
            p.ellipse(-6, 0, 3, 2);
            p.ellipse(6, 0, 3, 2);
            // Head (hood with more detail)
            p.fill(80, 60, 40); // Darker shade for hood
            p.ellipse(0, -6, 8, 6);
            p.fill(60, 40, 20); // Even darker for depth
            p.ellipse(0, -5, 6, 4);
            // Face detail with goggles
            p.fill(200, 180, 150); // Skin tone
            p.ellipse(0, -5, 4, 2);
            p.fill(50, 50, 50); // Goggles
            p.ellipse(-1, -5, 2, 1);
            p.ellipse(1, -5, 2, 1);
            // Shadow
            p.fill(80, 60, 40, 100); // Semi-transparent shadow
            p.ellipse(0, 6, 12, 4);
            p.pop();
          }
        }

        collectResource() {
          let currentResources = resources[\`$\{worldX},$\{worldY}\`] || [];
          for (let i = currentResources.length - 1; i >= 0; i--) {
            let res = currentResources[i];
            if (p.dist(this.x, this.y, res.x, res.y) < 20) {
              this.inventory[res.type]++;
              currentResources.splice(i, 1);
            }
          }
        }
      }

      // Hoverbike class
      class Hoverbike {
        constructor(x, y) {
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
          this.collisionCooldown = 0; // Cooldown timer for collisions
        }

        update() {
          if (riding) {
            this.handleControls();
            this.applyMovement();
            this.checkCollisions();
            // Update collision cooldown
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
          if (this.collisionCooldown > 0) return; // Skip collision check if on cooldown

          let currentObstacles = obstacles[\`$\{worldX},$\{worldY}\`] || [];
          for (let obs of currentObstacles) {
            if (obs.type === 'rock') {
              let dx = this.x - obs.x;
              let dy = this.y - obs.y;
              let hitboxWidth = 30 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
              let hitboxHeight = 30 * obs.size * (obs.aspectRatio < 1 ? 1 / p.abs(obs.aspectRatio) : 1);
              let normalizedX = dx / hitboxWidth;
              let normalizedY = dy / hitboxHeight;
              let distance = p.sqrt(normalizedX * normalizedX + normalizedY * normalizedY);

              if (distance < 1) { // Inside the elliptical hitbox
                this.health = p.max(0, this.health - 10); // 10 damage for rocks
                this.velocityX = -this.velocityX * 0.5;
                this.velocityY = -this.velocityY * 0.5;
                this.collisionCooldown = 30; // Set cooldown (30 frames, ~0.5 seconds at 60 FPS)
                let pushDistance = (1 - distance) * 30;
                let pushX = normalizedX * pushDistance;
                let pushY = normalizedY * pushDistance;
                this.x += pushX * hitboxWidth / 30;
                this.y += pushY * hitboxHeight / 30;
                break; // Exit loop after first collision to avoid multiple hits
              }
            } else if (obs.type === 'cactus') {
              let dx = this.x - obs.x;
              let dy = this.y - obs.y;
              let hitboxWidth = 20 * obs.size;
              let hitboxHeight = 20 * obs.size;
              let distance = p.sqrt(dx * dx + dy * dy);

              if (distance < hitboxWidth) {
                this.health = p.max(0, this.health - 3); // 3 damage for cacti
                this.velocityX *= 0.8; // Slow down slightly
                this.velocityY *= 0.8;
                this.collisionCooldown = 20; // Shorter cooldown
                let pushDistance = (hitboxWidth - distance);
                let pushX = (dx / distance) * pushDistance;
                let pushY = (dy / distance) * pushDistance;
                this.x += pushX;
                this.y += pushY;
                break;
              }
            }
            // No collision for bushes (already removed) or grass (now part of background)
          }
        }

        display() {
          if (this.worldX === worldX && this.worldY === worldY) {
            p.push();
            p.translate(this.x, this.y);
            p.rotate(this.angle);
            // Futuristic motorbike design (top-down perspective)
            // Main body (sleek and angular)
            p.fill(80, 80, 90); // Dark metallic gray
            p.beginShape();
            p.vertex(-8, -15); // Front point
            p.vertex(-12, -5); // Front left edge
            p.vertex(-10, 5);  // Mid left
            p.vertex(-5, 15);  // Rear left
            p.vertex(5, 15);   // Rear right
            p.vertex(10, 5);   // Mid right
            p.vertex(12, -5);  // Front right edge
            p.endShape(p.CLOSE);

            // Cockpit area (slightly raised)
            p.fill(60, 60, 70); // Darker gray for depth
            p.beginShape();
            p.vertex(-5, -5);  // Front left
            p.vertex(5, -5);   // Front right
            p.vertex(5, 5);    // Rear right
            p.vertex(-5, 5);   // Rear left
            p.endShape(p.CLOSE);

            // Jet engine at the back
            p.fill(100, 100, 110); // Lighter metallic gray
            p.beginShape();
            p.vertex(-4, 15);  // Left edge of engine
            p.vertex(4, 15);   // Right edge of engine
            p.vertex(3, 20);   // Right exhaust
            p.vertex(-3, 20);  // Left exhaust
            p.endShape(p.CLOSE);

            // Jet exhaust glow
            p.fill(255, 150, 50, 200); // Orange glow
            p.ellipse(0, 22, 6, 3); // Small glow at exhaust
            p.fill(255, 200, 100, 150); // Brighter inner glow
            p.ellipse(0, 22, 3, 1.5);

            // Details (lines and highlights)
            p.fill(120, 120, 130); // Lighter highlights
            p.ellipse(-8, 0, 4, 4); // Left side detail
            p.ellipse(8, 0, 4, 4);  // Right side detail
            p.stroke(50, 50, 60); // Dark lines for paneling
            p.strokeWeight(1);
            p.line(-5, -5, -5, 5);  // Left cockpit line
            p.line(5, -5, 5, 5);    // Right cockpit line
            p.noStroke();

            // Shadow
            p.fill(50, 50, 60, 100); // Semi-transparent shadow
            p.ellipse(0, 18, 20, 5); // Adjusted shadow position to account for new shape
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

      // Function to generate a unique, jagged rock shape with variable size and aspect ratio
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

      // Function to generate a bush shape with more irregularity
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

      // Function to generate a simpler cactus shape with deterministic properties
      function generateCactusShape(size, zoneKey, index) {
        let shape = [];
        // Use a deterministic seed based on zoneKey and cactus index
        p.noiseSeed(zoneKey.hashCode() + index);
        let baseHeight = 25 * size; // Fixed height for consistency
        let baseWidth = 6 * size;   // Fixed width for consistency

        // Main body (simple rectangular shape with slight irregularity)
        let bodyPoints = [];
        for (let i = 0; i < 8; i++) {
          let t = i / 7;
          let x = p.lerp(-baseWidth, baseWidth, t);
          let y = p.lerp(0, -baseHeight, t);
          x += p.noise(t * 2) * 1 - 0.5; // Slight irregularity
          bodyPoints.push({ x, y });
        }
        shape.push({ type: 'body', points: bodyPoints });

        // Add one arm on each side (deterministic positions)
        let armHeight = baseHeight * 0.5;
        let armWidth = baseWidth * 0.6;
        // Left arm
        let leftArmPoints = [];
        for (let j = 0; j < 6; j++) {
          let t = j / 5;
          let x = p.lerp(-baseWidth, -baseWidth - armWidth, t);
          let y = p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
          x += p.noise(t * 2 + 10) * 0.5 - 0.25;
          leftArmPoints.push({ x, y });
        }
        shape.push({ type: 'arm', points: leftArmPoints });

        // Right arm
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

      // Function to generate sand texture for a specific zone
      function generateSandTexture(zoneKey) {
        let texture = p.createGraphics(p.width, p.height);
        texture.noSmooth();
        texture.noStroke();
        p.noiseSeed(zoneKey.hashCode()); // Use a deterministic seed based on zoneKey
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

      // Function to generate burnt grass texture for a specific zone
      function generateBurntGrassTexture(zoneKey) {
        let texture = p.createGraphics(p.width, p.height);
        texture.noSmooth();
        texture.noStroke();
        p.noiseSeed(zoneKey.hashCode() + 1); // Use a deterministic seed, different from sand
        for (let i = 0; i < p.width; i += 4) { // Adjusted step size for balanced density
          for (let j = 0; j < p.height; j += 4) {
            let noiseVal = p.noise(i * 0.02, j * 0.02);
            if (noiseVal > 0.55) { // Lowered threshold for more grass
              let density = p.map(noiseVal, 0.55, 1, 0, 0.8); // Increased density
              if (p.random() < density) {
                let colorVariation = p.random(-8, 8); // Slightly more variation
                let r = 180 + colorVariation; // Adjusted color for more contrast
                let g = 150 + colorVariation;
                let b = 80 + colorVariation;
                texture.fill(r, g, b, 220); // Slightly less transparency
                // Draw a grass blade
                let height = p.random(2, 5); // Balanced height
                let lean = p.random(-0.3, 0.3); // Balanced lean
                texture.beginShape();
                texture.vertex(i, j);
                texture.vertex(i + lean, j - height);
                texture.vertex(i + 0.7, j); // Slightly wider blades
                texture.endShape(p.CLOSE); 
                // Highlight
                texture.fill(r + 15, g + 15, b + 15, 220);
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

      // World generation
      function generateNewArea(x, y) {
        let zoneKey = \`$\{x},$\{y}\`;
        // Only generate if the area hasn't been generated before
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
                shape: generateCactusShape(size, zoneKey, i), // Pass zoneKey and index
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
                shape: generateCactusShape(size, zoneKey, i), // Pass zoneKey and index
                size: size
              });
            }
          }
          obstacles[zoneKey] = areaObstacles;
          generateResources(x, y);
          generatedAreas.add(zoneKey); // Mark this area as generated
        }
      }

      function generateResources(x, y) {
        let areaResources = [];
        for (let i = 0; i < 5; i++) {
          areaResources.push({ x: p.random(p.width), y: p.random(p.height), type: 'metal' });
        }
        resources[\`$\{x},$\{y}\`] = areaResources;
      }

      function handleObstacles() {
        let currentObstacles = obstacles[\`$\{worldX},$\{worldY}\`] || [];
        for (let obs of currentObstacles) {
          if (obs.type === 'rock') {
            p.push();
            p.translate(obs.x, obs.y);

            // Drop shadow
            p.fill(50, 40, 30, 80);
            let shadowOffsetX = 5 * obs.size;
            let shadowOffsetY = 5 * obs.size;
            let shadowWidth = 20 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
            let shadowHeight = 20 * obs.size * (obs.aspectRatio < 1 ? 1 / p.abs(obs.aspectRatio) : 1);
            p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

            // Base layer
            p.fill(80, 70, 60);
            p.beginShape();
            for (let point of obs.shape) {
              p.vertex(point.x, point.y);
            }
            p.endShape(p.CLOSE);

            // Mid-layer with shading
            p.fill(100, 90, 80);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = 2 * obs.size;
              let offsetY = 2 * obs.size;
              p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
            }
            p.endShape(p.CLOSE);

            // Highlight layer
            p.fill(120, 110, 100);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = -2 * obs.size;
              let offsetY = -2 * obs.size;
              p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
            }
            p.endShape(p.CLOSE);

            // Details
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

            // Shadow
            p.fill(50, 40, 30, 80);
            p.ellipse(5, 5, 40, 30);

            // Base structure (sandstone blocks)
            p.fill(210, 180, 140); // Sandstone color
            p.beginShape();
            p.vertex(-20, -15);
            p.vertex(-15, -20);
            p.vertex(15, -20);
            p.vertex(20, -15);
            p.vertex(20, 15);
            p.vertex(-20, 15);
            p.endShape(p.CLOSE);

            // Corroded wood planks
            p.fill(90, 70, 50); // Corroded wood color
            p.beginShape();
            p.vertex(-15, -20);
            p.vertex(-10, -25);
            p.vertex(10, -25);
            p.vertex(15, -20);
            p.endShape(p.CLOSE);
            // Wood details (cracks and wear)
            p.stroke(70, 50, 30);
            p.strokeWeight(1);
            p.line(-12, -22, -8, -24);
            p.line(5, -23, 10, -22);
            p.noStroke();

            // Scrapped metal patches
            p.fill(120, 120, 120); // Metal color
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
            // Metal details (rust)
            p.fill(150, 80, 40);
            p.ellipse(-15, 2, 3, 2);
            p.ellipse(15, 2, 2, 3);

            // Windmill on the roof
            p.push();
            p.translate(0, -25); // Position on top of the hut
            p.rotate(windmillAngle); // Animate rotation
            // Windmill blades
            p.fill(100, 80, 60); // Corroded wood for blades
            for (let i = 0; i < 4; i++) {
              p.push();
              p.rotate(i * p.PI / 2); // Four blades at 90-degree intervals
              p.beginShape();
              p.vertex(0, 0);
              p.vertex(2, -10);
              p.vertex(-2, -10);
              p.endShape(p.CLOSE);
              p.pop();
            }
            // Windmill center
            p.fill(120, 120, 120); // Metal center
            p.ellipse(0, 0, 4, 4);
            p.pop();

            p.pop();
          } else if (obs.type === 'bush') {
            p.push();
            p.translate(obs.x, obs.y);

            // Drop shadow (more subtle, beige/brown)
            p.fill(180, 150, 100, 50); // Beige/brown with lower opacity
            let shadowOffsetX = 2 * obs.size; // Reduced offset
            let shadowOffsetY = 2 * obs.size;
            let shadowWidth = 10 * obs.size; // Reduced size
            let shadowHeight = 10 * obs.size;
            p.ellipse(shadowOffsetX, shadowOffsetY, shadowWidth, shadowHeight);

            // Base layer (darker green)
            p.fill(50, 70, 30);
            p.beginShape();
            for (let point of obs.shape) {
              p.vertex(point.x, point.y);
            }
            p.endShape(p.CLOSE);

            // Mid-layer (mid-tone green)
            p.fill(70, 90, 50);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = 1 * obs.size;
              let offsetY = 1 * obs.size;
              p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
            }
            p.endShape(p.CLOSE);

            // Highlight layer (lighter green)
            p.fill(90, 110, 70);
            p.beginShape();
            for (let point of obs.shape) {
              let offsetX = -1 * obs.size;
              let offsetY = -1 * obs.size;
              p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
            }
            p.endShape(p.CLOSE);

            // Details (leaves and twigs)
            p.fill(40, 60, 20);
            p.ellipse(-3 * obs.size, -2 * obs.size, 2 * obs.size, 1 * obs.size);
            p.ellipse(2 * obs.size, 1 * obs.size, 1 * obs.size, 2 * obs.size);
            p.fill(100, 120, 80);
            p.ellipse(-1 * obs.size, 2 * obs.size, 1 * obs.size, 1 * obs.size);
            // Twigs
            p.stroke(70, 50, 30);
            p.strokeWeight(1 * obs.size);
            p.line(0, 0, -5 * obs.size, -3 * obs.size);
            p.line(0, 0, 4 * obs.size, -2 * obs.size);
            p.noStroke();
            p.pop();
          } else if (obs.type === 'cactus') {
            p.push();
            p.translate(obs.x, obs.y);

            // Drop shadow (smaller, beige/brown, more subtle)
            p.fill(180, 150, 100, 50); // Beige/brown with lower opacity
            let shadowOffsetX = 2 * obs.size; // Moved left (from 4 to 2)
            let shadowOffsetY = 2 * obs.size; // Moved up (from 4 to 2)
            let shadowWidth = 8 * obs.size; // Reduced from 15 to 8
            let shadowHeight = 10 * obs.size; // Reduced from 20 to 10
            p.beginShape();
            for (let i = 0; i < 8; i++) {
              let angle = p.map(i, 0, 8, 0, p.TWO_PI);
              let radiusX = shadowWidth * (0.8 + p.noise(angle * 0.5) * 0.4); // Irregular width
              let radiusY = shadowHeight * (0.8 + p.noise(angle * 0.5 + 10) * 0.4); // Irregular height
              let x = shadowOffsetX + p.cos(angle) * radiusX;
              let y = shadowOffsetY + p.sin(angle) * radiusY;
              p.vertex(x, y);
            }
            p.endShape(p.CLOSE);

            // Cactus body and arms with texture
            for (let part of obs.shape) {
              // Base layer
              p.fill(40, 80, 40);
              p.beginShape();
              for (let point of part.points) {
                p.vertex(point.x, point.y);
              }
              p.endShape(p.CLOSE);

              // Highlight layer
              p.fill(60, 100, 60);
              p.beginShape();
              for (let i = 0; i < part.points.length; i++) {
                let point = part.points[i];
                let offsetX = -1 * obs.size;
                let offsetY = -1 * obs.size;
                p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
              }
              p.endShape(p.CLOSE);

              // Texture (ridges)
              p.fill(50, 90, 50);
              for (let i = 0; i < part.points.length - 1; i += 2) {
                let p1 = part.points[i];
                let p2 = part.points[i + 1];
                p.ellipse((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, 2 * obs.size, 2 * obs.size);
              }
            }

            // Spines (simplified and deterministic)
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
        let currentResources = resources[\`$\{worldX},$\{worldY}\`] || [];
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

      // Area transition logic
      function checkBorder() {
        if (player.x > p.width) {
          worldX++;
          player.x = 0;
          if (riding) {
            hoverbike.x = player.x;
            hoverbike.worldX = worldX;
          }
          generateNewArea(worldX, worldY); // Will only generate if not already generated
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

      // Health bar display
      function drawHealthBar() {
        if (hoverbike.worldX === worldX && hoverbike.worldY === worldY) {
          let barWidth = 40;
          let barHeight = 5;
          let healthRatio = hoverbike.health / hoverbike.maxHealth;
          healthRatio = p.constrain(healthRatio, 0, 1); // Ensure health ratio stays between 0 and 1

          // Background bar
          p.fill(80, 0, 0);
          p.beginShape();
          p.vertex(hoverbike.x - barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x + barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x + barWidth / 2 + 2, hoverbike.y - 20 + barHeight);
          p.vertex(hoverbike.x - barWidth / 2 - 2, hoverbike.y - 20 + barHeight);
          p.endShape(p.CLOSE);

          // Details on background
          p.fill(100, 20, 20);
          p.ellipse(hoverbike.x - barWidth / 2 + 5, hoverbike.y - 20 + barHeight / 2, 3, 3);
          p.ellipse(hoverbike.x + barWidth / 2 - 5, hoverbike.y - 20 + barHeight / 2, 3, 3);

          // Health fill
          p.fill(0, 80, 0);
          let healthWidth = barWidth * healthRatio;
          p.beginShape();
          p.vertex(hoverbike.x - barWidth / 2, hoverbike.y - 20);
          p.vertex(hoverbike.x - barWidth / 2 + healthWidth, hoverbike.y - 20);
          p.vertex(hoverbike.x - barWidth / 2 + healthWidth + 2, hoverbike.y - 20 + barHeight);
          p.vertex(hoverbike.x - barWidth / 2 - 2, hoverbike.y - 20 + barHeight);
          p.endShape(p.CLOSE);

          // Highlight on health
          p.fill(0, 100, 0);
          p.ellipse(hoverbike.x - barWidth / 2 + healthWidth / 2, hoverbike.y - 20 + barHeight / 2, 4, 2);
        }
      }

      // Instructions display
      function drawInstructions() {
        p.fill(255);
        p.textSize(16);
        p.text("Use arrow keys to move.", 10, 30);
        p.text("Press 'f' to mount/dismount hoverbike.", 10, 50);
        p.text("Press 'r' to repair hoverbike with metal.", 10, 70);
        p.text("Press 's' to upgrade speed with metal.", 10, 90);
        p.text("Press 'd' to upgrade durability with metal.", 10, 110);
        
        // Display inventory
        p.text("Metal: " + player.inventory.metal, 10, 130);
        
        // Display coordinates
        p.text("Zone: " + worldX + "," + worldY, 10, 150);
      }

      // Utility function to create a deterministic hash code for a string (used for noiseSeed)
      String.prototype.hashCode = function() {
        let hash = 0;
        for (let i = 0; i < this.length; i++) {
          let char = this.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        return hash;
      };

      // Setup function
      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        p.noSmooth(); // Enable pixel art style
        // Spawn player just below the hut (hut at width/2, height/2 - 100)
        player = new Player(p.width / 2, p.height / 2 - 50); // Adjusted spawn position
        hoverbike = new Hoverbike(p.width / 2, p.height / 2);
        worldX = 0;
        worldY = 0;
        generateNewArea(0, 0); // Initial area generation
        generatedAreas.add(\`$\{worldX},$\{worldY}\`); // Mark starting area as generated
      };

      // Draw function
      p.draw = () => {
        let zoneKey = \`$\{worldX},$\{worldY}\`;
        // Draw sand texture
        if (sandTextures[zoneKey]) {
          p.image(sandTextures[zoneKey], 0, 0);
        }
        // Draw grass texture
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
        // Update windmill animation
        windmillAngle += 0.05; // Adjust speed of rotation
      };
      
      // Key press handling
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
        // We need to regenerate textures when window size changes
        sandTextures = {};
        grassTextures = {};
        generateNewArea(worldX, worldY);
      };
    };
    
    // Create a new p5 instance with the sketch
    const myP5 = new p5(sketch, sketchRef.current);
    
    // Clean up function
    return () => {
      myP5.remove();
    };
  }, [sketchRef]);
  
  return <div ref={sketchRef} className="w-full h-full" />;
};

export default GameSketch;
