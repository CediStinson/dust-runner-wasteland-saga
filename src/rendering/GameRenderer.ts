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
