
import p5 from 'p5';

export class TerrainGenerator {
  private p: any;
  private sandTextures: Record<string, any>;
  private grassTextures: Record<string, any>;

  constructor(p: any) {
    this.p = p;
    this.sandTextures = {};
    this.grassTextures = {};
  }

  generateSandTexture(zoneKey: string) {
    let texture = this.p.createGraphics(this.p.width, this.p.height);
    texture.noSmooth();
    texture.noStroke();
    this.p.noiseSeed(zoneKey.hashCode());
    for (let i = 0; i < this.p.width; i += 4) {
      for (let j = 0; j < this.p.height; j += 4) {
        let noiseVal = this.p.noise(i * 0.01, j * 0.01);
        let r = this.p.map(noiseVal, 0, 1, 220, 255);
        let g = this.p.map(noiseVal, 0, 1, 180, 200);
        let b = this.p.map(noiseVal, 0, 1, 100, 120);
        texture.fill(r, g, b);
        texture.rect(i, j, 4, 4);
        if (noiseVal > 0.6) {
          texture.fill(r - 20, g - 20, b - 20);
          texture.rect(i + 1, j + 1, 2, 2);
        }
      }
    }
    this.sandTextures[zoneKey] = texture;
  }

  generateBurntGrassTexture(zoneKey: string) {
    let texture = this.p.createGraphics(this.p.width, this.p.height);
    texture.noSmooth();
    texture.noStroke();
    this.p.noiseSeed(zoneKey.hashCode() + 1);
    for (let i = 0; i < this.p.width; i += 4) {
      for (let j = 0; j < this.p.height; j += 4) {
        let noiseVal = this.p.noise(i * 0.02, j * 0.02);
        if (noiseVal > 0.55) {
          let density = this.p.map(noiseVal, 0.55, 1, 0, 0.8);
          if (this.p.random() < density) {
            let colorVariation = this.p.random(-8, 8);
            let r = 180 + colorVariation;
            let g = 150 + colorVariation;
            let b = 80 + colorVariation;
            texture.fill(r, g, b, 220);
            let height = this.p.random(2, 5);
            let lean = this.p.random(-0.3, 0.3);
            texture.beginShape();
            texture.vertex(i, j);
            texture.vertex(i + lean, j - height);
            texture.vertex(i + 0.7, j);
            texture.endShape(this.p.CLOSE);
            this.p.fill(r + 15, g + 15, b + 15, 220);
            texture.beginShape();
            texture.vertex(i, j);
            texture.vertex(i + lean * 0.7, j - height * 0.7);
            texture.vertex(i + 0.5, j);
            texture.endShape(this.p.CLOSE);
          }
        }
      }
    }
    this.grassTextures[zoneKey] = texture;
  }

  getSandTexture(zoneKey: string) {
    return this.sandTextures[zoneKey];
  }

  getGrassTexture(zoneKey: string) {
    return this.grassTextures[zoneKey];
  }

  clearTextures() {
    this.sandTextures = {};
    this.grassTextures = {};
  }
}
