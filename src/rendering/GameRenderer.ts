
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
