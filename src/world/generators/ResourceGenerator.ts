
import p5 from 'p5';

export class ResourceGenerator {
  constructor(private p: any) {}

  generateCopperOre(zoneKey: string, nearbyRock: any) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(6, 9));
    let baseRadius = this.p.random(6, 10);
    this.p.noiseSeed(zoneKey.hashCode() + nearbyRock.x + nearbyRock.y);
    
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * 0.5) * 3 - 1.5;
      let x = this.p.cos(angle) * radius;
      let y = this.p.sin(angle) * radius;
      shape.push({ x, y });
    }
    
    let rockRadius = 25 * nearbyRock.size * (nearbyRock.aspectRatio > 1 ? nearbyRock.aspectRatio : 1);
    let angleHash = (nearbyRock.x * 10000 + nearbyRock.y).toString().hashCode();
    let angle = (angleHash % 628) / 100;
    let oreX = nearbyRock.x + Math.cos(angle) * rockRadius;
    let oreY = nearbyRock.y + Math.sin(angle) * rockRadius;
    
    oreX = this.p.constrain(oreX, 30, this.p.width - 30);
    oreY = this.p.constrain(oreY, 30, this.p.height - 30);
    
    return {
      x: oreX,
      y: oreY,
      type: 'copper',
      shape: shape
    };
  }

  getValidPosition(edgeBuffer: number) {
    return {
      x: this.p.random(edgeBuffer, this.p.width - edgeBuffer),
      y: this.p.random(edgeBuffer, this.p.height - edgeBuffer)
    };
  }
}
