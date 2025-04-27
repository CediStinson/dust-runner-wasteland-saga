
import p5 from 'p5';

export class ObstacleShapeGenerator {
  constructor(private p: any) {}

  generateRockShape(size: number, aspectRatio: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(8, 12));
    let baseRadius = this.p.random(20, 30) * size;
    let noiseScale = this.p.random(0.3, 0.7);
    this.p.noiseSeed(this.p.random(1000));

    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * noiseScale) * 8 - 4;
      let x = this.p.cos(angle) * radius * (aspectRatio > 1 ? aspectRatio : 1) + this.p.random(-3, 3);
      let y = this.p.sin(angle) * radius * (aspectRatio < 1 ? 1 / this.p.abs(aspectRatio) : 1) + this.p.random(-3, 3);
      shape.push({ x, y });
    }
    return shape;
  }

  generateBushShape(size: number) {
    let shape = [];
    let numPoints = this.p.floor(this.p.random(8, 12));
    let baseRadius = this.p.random(10, 15) * size;
    this.p.noiseSeed(this.p.random(1000));

    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let radius = baseRadius + this.p.noise(angle * 0.5) * 8 - 4;
      let x = this.p.cos(angle) * radius + this.p.random(-3, 3);
      let y = this.p.sin(angle) * radius + this.p.random(-3, 3);
      shape.push({ x, y });
    }
    return shape;
  }

  generateCactusShape(size: number, zoneKey: string, index: number) {
    let shape = [];
    this.p.noiseSeed(zoneKey.hashCode() + index);
    let baseHeight = 25 * size;
    let baseWidth = 6 * size;

    let bodyPoints = [];
    for (let i = 0; i < 8; i++) {
      let t = i / 7;
      let x = this.p.lerp(-baseWidth, baseWidth, t);
      let y = this.p.lerp(0, -baseHeight, t);
      x += this.p.noise(t * 2) * 1 - 0.5;
      bodyPoints.push({ x, y });
    }
    shape.push({ type: 'body', points: bodyPoints });

    let armHeight = baseHeight * 0.5;
    let armWidth = baseWidth * 0.6;
    let leftArmPoints = [];
    for (let j = 0; j < 6; j++) {
      let t = j / 5;
      let x = this.p.lerp(-baseWidth, -baseWidth - armWidth, t);
      let y = this.p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
      x += this.p.noise(t * 2 + 10) * 0.5 - 0.25;
      leftArmPoints.push({ x, y });
    }
    shape.push({ type: 'arm', points: leftArmPoints });

    let rightArmPoints = [];
    for (let j = 0; j < 6; j++) {
      let t = j / 5;
      let x = this.p.lerp(baseWidth, baseWidth + armWidth, t);
      let y = this.p.lerp(-baseHeight * 0.5, -baseHeight * 0.5 - armHeight, t);
      x += this.p.noise(t * 2 + 20) * 0.5 - 0.25;
      rightArmPoints.push({ x, y });
    }
    shape.push({ type: 'arm', points: rightArmPoints });

    return shape;
  }
}
