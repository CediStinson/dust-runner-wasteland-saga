import p5 from 'p5';

export default class BackgroundRenderer {
  private p: p5;
  private worldGenerator: any;
  private worldX: number;
  private worldY: number;
  private timeOfDay: number;
  private sandDuneTexture: any;

  constructor(p: p5, worldGenerator: any, worldX: number, worldY: number, timeOfDay: number) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = timeOfDay;
    this.sandDuneTexture = null;
    
    // Generate sand dune textures
    this.generateSandDuneTexture();
  }
  
  updateWorldCoordinates(worldX: number, worldY: number) {
    this.worldX = worldX;
    this.worldY = worldY;
    
    // Regenerate sand dune texture for this area
    this.generateSandDuneTexture();
  }
  
  updateTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }
  
  generateSandDuneTexture() {
    // Create a texture for the sand dunes
    const width = this.p.width;
    const height = this.p.height;
    
    // Remove previous texture if it exists to avoid memory leaks
    if (this.sandDuneTexture) {
      this.sandDuneTexture.remove();
    }
    
    this.sandDuneTexture = this.p.createGraphics(width, height);
    
    // Use a transparent background
    this.sandDuneTexture.clear();
    
    // Only add sand dunes to the home area (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) return;
    
    this.sandDuneTexture.noFill();
    this.sandDuneTexture.stroke(245, 240, 230, 100); // Light beige, subtle
    this.sandDuneTexture.strokeWeight(2);
    
    // Create a few long, curvy sand dunes
    const numDunes = 6;
    for (let i = 0; i < numDunes; i++) {
      const startX = this.p.random(width * 0.1, width * 0.9);
      const startY = this.p.random(height * 0.1, height * 0.9);
      
      // Check if this dune would be too close to the center (where the hut/fuel station are)
      const distToCenter = this.p.dist(startX, startY, width/2, height/2);
      if (distToCenter < 150) continue; // Skip this dune if it's too close to the center
      
      // Create a curvy line using Perlin noise
      this.sandDuneTexture.beginShape();
      this.sandDuneTexture.curveVertex(startX, startY);
      this.sandDuneTexture.curveVertex(startX, startY);
      
      const numPoints = this.p.floor(this.p.random(5, 12));
      const noiseScale = 0.01;
      const noiseSeed = this.p.random(1000);
      
      for (let j = 1; j <= numPoints; j++) {
        const t = j / numPoints;
        const noise1 = this.p.noise(noiseSeed + t * 10) * 200 - 100;
        const noise2 = this.p.noise(noiseSeed + 100 + t * 10) * 200 - 100;
        
        const x = startX + t * this.p.random(100, 300) + noise1;
        const y = startY + t * this.p.random(-150, 150) + noise2;
        
        this.sandDuneTexture.curveVertex(x, y);
      }
      
      this.sandDuneTexture.curveVertex(startX + this.p.random(200, 400), startY + this.p.random(-100, 100));
      this.sandDuneTexture.endShape();
    }
  }
  
  drawBackground() {
    let zoneKey = `${this.worldX},${this.worldY}`;
    
    // Use a soft, gradient-like background to eliminate hard lines
    const baseColor = this.p.color(220, 210, 180);
    const softVariation = 10;
    
    // Create a soft background with slight color variations
    for (let y = 0; y < this.p.height; y++) {
      const colorVariation = this.p.map(y, 0, this.p.height, -softVariation, softVariation);
      const currentColor = this.p.color(
        this.p.red(baseColor) + colorVariation,
        this.p.green(baseColor) + colorVariation,
        this.p.blue(baseColor) + colorVariation
      );
      
      this.p.stroke(currentColor);
      this.p.line(0, y, this.p.width, y);
    }
    
    // Draw sand texture if available
    if (this.worldGenerator.getSandTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getSandTexture(zoneKey), 0, 0);
    }
    
    // Draw grass texture if available
    if (this.worldGenerator.getGrassTexture(zoneKey)) {
      this.p.image(this.worldGenerator.getGrassTexture(zoneKey), 0, 0);
    }
    
    // Draw sand dunes on the ground
    if (this.sandDuneTexture) {
      this.p.image(this.sandDuneTexture, 0, 0);
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
  
  render() {
    this.drawBackground();
    this.applyDaytimeTint();
  }
}
