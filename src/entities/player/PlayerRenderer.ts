
import p5 from 'p5';

export class PlayerRenderer {
  private p: any;
  
  constructor(p: any) {
    this.p = p;
  }
  
  displayPlayer(
    riding: boolean,
    carryingFuelCanister: boolean,
    armAnimationOffset: number,
    hairColor: { r: number, g: number, b: number }
  ): void {
    if (riding) {
      this.displayRidingPlayerTopDown(hairColor);
    } else {
      this.displayStandingPlayerTopDown(armAnimationOffset, hairColor);
      
      if (carryingFuelCanister) {
        this.displayFuelCanister();
      }
    }
  }
  
  displayFuelCanister(): void {
    this.p.push();
    this.p.translate(0, 5);
    
    this.p.fill(220, 50, 50);
    this.p.stroke(0);
    this.p.strokeWeight(0.5);
    this.p.rect(-3, -3, 6, 6, 1);
    
    this.p.fill(50);
    this.p.rect(-1, -4, 2, 1);
    
    this.p.stroke(30);
    this.p.line(-2, -3, 2, -3);
    
    this.p.pop();
  }
  
  displayRidingPlayerTopDown(hairColor: { r: number, g: number, b: number }): void {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 0, 12, 9);
    
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);
    this.p.fill(90, 130, 90, 255);
    this.p.ellipse(0, 0, 12, 9);
    this.p.noStroke();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 6, 6);
    
    this.drawTopDownHair(hairColor);
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(-4, 6, 4, 4);
    this.p.ellipse(4, 6, 4, 4);
  }
  
  displayStandingPlayerTopDown(
    armAnimationOffset: number,
    hairColor: { r: number, g: number, b: number }
  ): void {
    this.p.fill(0, 0, 0, 40);
    this.p.noStroke();
    this.p.ellipse(0, 2, 12, 9);
    
    this.p.strokeWeight(0.5);
    this.p.stroke(0, 0, 0, 200);
    this.p.fill(90, 130, 90, 255);
    this.p.ellipse(0, 0, 12, 9);
    this.p.noStroke();
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(0, 0, 6, 6);
    
    this.drawTopDownHair(hairColor);
    
    this.p.fill(245, 220, 190);
    this.p.ellipse(-5, 3 + armAnimationOffset, 4, 4);
    this.p.ellipse(5, 3 - armAnimationOffset, 4, 4);
  }
  
  drawTopDownHair(hairColor: { r: number, g: number, b: number }): void {
    const { r, g, b } = hairColor;
    
    this.p.strokeWeight(1);
    this.p.stroke(0, 0, 0, 230); // Changed from '#000000e6' to RGB with alpha
    this.p.push();
    this.p.translate(0, -2.5);
    this.p.fill(r, g, b);
    this.p.ellipse(0, 0, 6, 6);
    this.p.noStroke();
    this.p.fill(r-30, g-30, b-30);
    this.p.stroke(0, 0, 0, 230); // Changed from '#000000e6' to RGB with alpha
    this.p.strokeWeight(0.5);
    this.p.fill(r, g, b);
    this.p.beginShape();
    this.p.vertex(-2, -1);
    this.p.vertex(2, -1);
    this.p.vertex(3, 2);
    this.p.vertex(3, -5);
    this.p.vertex(-3, -2);
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }
  
  displayDigProgress(digTimer: number): void {
    let progressWidth = 30;
    let progressHeight = 4;
    let progress = digTimer / 480;
    
    this.p.push();
    this.p.translate(0, -20);
    
    this.p.fill(0, 0, 0, 150);
    this.p.rect(-progressWidth/2, 0, progressWidth, progressHeight, 2);
    
    this.p.fill(50, 200, 50);
    this.p.rect(-progressWidth/2, 0, progressWidth * progress, progressHeight, 2);
    
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(8);
    this.p.text("Mining Copper", 0, -5);
    
    this.p.pop();
  }
}
