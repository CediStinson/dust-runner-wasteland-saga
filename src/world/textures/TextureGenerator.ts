
import p5 from 'p5';

export default class TextureGenerator {
  p: p5;

  constructor(p: p5) {
    this.p = p;
  }

  generateSandTexture(width: number, height: number): p5.Graphics {
    const texture = this.p.createGraphics(width, height);
    
    texture.background(220, 210, 180); // Base sand color
    
    // Add texture variations
    for (let i = 0; i < width; i += 5) {
      for (let j = 0; j < height; j += 5) {
        const noiseVal = this.p.noise(i * 0.01, j * 0.01) * 20;
        texture.fill(220 - noiseVal, 210 - noiseVal, 180 - noiseVal, 20);
        texture.rect(i, j, 5, 5);
      }
    }
    
    // Create some darker patches
    for (let i = 0; i < 100; i++) {
      const patchX = this.p.random(width);
      const patchY = this.p.random(height);
      const patchSize = this.p.random(20, 80);
      
      texture.fill(200, 190, 160, 20);
      texture.ellipse(patchX, patchY, patchSize, patchSize);
    }
    
    return texture;
  }

  generateGrassTexture(width: number, height: number): p5.Graphics {
    const texture = this.p.createGraphics(width, height);
    
    // Always use clear to start with transparency
    texture.clear();
    
    // Randomize whether this zone has grass
    const hasGrass = this.p.random() < 0.3;
    
    if (hasGrass) {
      // Add sparse grass patches
      for (let i = 0; i < 50; i++) {
        const x = this.p.random(width);
        const y = this.p.random(height);
        const patchSize = this.p.random(40, 100);
        
        texture.fill(120, 150, 80, this.p.random(10, 30));
        texture.ellipse(x, y, patchSize, patchSize);
        
        // Add smaller, more saturated grass detail
        for (let j = 0; j < 5; j++) {
          texture.fill(100, 140, 60, this.p.random(5, 15));
          texture.ellipse(
            x + this.p.random(-patchSize/2, patchSize/2),
            y + this.p.random(-patchSize/2, patchSize/2),
            this.p.random(10, 20),
            this.p.random(10, 20)
          );
        }
      }
    }
    
    return texture;
  }
}
