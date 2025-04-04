
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

  // Update drawing methods to add back outlines
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
    this.p.beginShape();
    for (let point of obs.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);

    // Inner shapes
    this.p.noStroke();
    this.p.fill(60, 80, 60);
    this.p.beginShape();
    for (let point of obs.shape) {
      let offsetX = 0.5 * obs.size;
      let offsetY = 0.5 * obs.size;
      this.p.vertex(point.x * 0.8 + offsetX, point.y * 0.8 + offsetY);
    }
    this.p.endShape(this.p.CLOSE);

    this.p.fill(80, 100, 80);
    this.p.beginShape();
    for (let point of obs.shape) {
      let offsetX = -0.5 * obs.size;
      let offsetY = -0.5 * obs.size;
      this.p.vertex(point.x * 0.6 + offsetX, point.y * 0.6 + offsetY);
    }
    this.p.endShape(this.p.CLOSE);

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

    // Details (door)
    this.p.fill(80, 60, 40);
    this.p.stroke(50, 30, 10); // Added outline for door
    this.p.strokeWeight(1);    // Slightly thicker outline
    this.p.rect(-8 * obs.size, 6 * obs.size, 16 * obs.size, 8 * obs.size);
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
    this.p.beginShape();
    for (let i = 0; i < res.points.length; i++) {
      this.p.vertex(res.points[i].x, res.points[i].y);
    }
    this.p.endShape(this.p.CLOSE);
    
    // Copper veins with outline
    this.p.fill(200, 120, 40);
    this.p.stroke(160, 100, 30);
    this.p.strokeWeight(0.5);
    
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
    
    this.p.pop();
  }
