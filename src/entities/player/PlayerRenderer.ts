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
    this.p.stroke('#000000e6');
    this.p.push();
    this.p.translate(0, -2.5);
    this.p.fill(r, g, b);
    this.p.ellipse(0, 0, 6, 6);
    this.p.noStroke();
    this.p.fill(r-30, g-30, b-30);
    this.p.stroke('#000000e6');
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

  displayGrandpaNPC(
    armAnimationOffset: number,
    quote: string | null = null,
    showSpeechBubble: boolean = false
  ): void {
    // Grandpa colors
    const hairColor = { r: 200, g: 200, b: 220 };
    const beardColor = { r: 240, g: 240, b: 255 };
    const skinColor = { r: 230, g: 210, b: 175 };
    const shirtColor = { r: 130, g: 120, b: 180 };
    const pantsColor = { r: 90, g: 100, b: 120 };

    this.p.push();

    // Shadow
    this.p.fill(0, 0, 0, 30);
    this.p.noStroke();
    this.p.ellipse(0, 2, 12, 9);

    // Body (grandpa wears purple-ish shirt and gray pants)
    this.p.stroke(0, 0, 0, 200);
    this.p.strokeWeight(0.5);
    this.p.fill(shirtColor.r, shirtColor.g, shirtColor.b, 255);
    this.p.ellipse(0, 0, 12, 9);

    // Face
    this.p.noStroke();
    this.p.fill(skinColor.r, skinColor.g, skinColor.b);
    this.p.ellipse(0, 0, 6, 6);

    // Hair and beard
    // Top (balding with hair sides)
    this.p.push();
    this.p.translate(0, -2.5);
    this.p.fill(hairColor.r, hairColor.g, hairColor.b);
    this.p.ellipse(-2.5, 0, 2.5, 4);
    this.p.ellipse(2.5, 0, 2.5, 4);
    this.p.pop();

    // Beard
    this.p.push();
    this.p.translate(0, 2.7);
    this.p.fill(beardColor.r, beardColor.g, beardColor.b, 225);
    this.p.ellipse(0, 1, 5, 3);
    this.p.ellipse(-1, 2, 2, 1);
    this.p.ellipse(1, 2, 2, 1);
    this.p.pop();

    // Small glasses
    this.p.push();
    this.p.stroke(30);
    this.p.noFill();
    this.p.ellipse(-1.2, 0, 1.4, 1);
    this.p.ellipse(1.2, 0, 1.4, 1);
    this.p.line(-0.6, 0, 0.6, 0);
    this.p.strokeWeight(0.5);
    this.p.line(-2, 0, -1.9, -1);
    this.p.line(2, 0, 1.9, -1);
    this.p.pop();

    // Nose (small)
    this.p.fill(skinColor.r - 10, skinColor.g - 10, skinColor.b - 30, 200);
    this.p.ellipse(0, 1, 0.7, 1.5);

    // Arms (hands behind back)
    this.p.fill(skinColor.r - 30, skinColor.g - 30, skinColor.b - 30);
    this.p.ellipse(-5, 3 + armAnimationOffset, 3, 3);
    this.p.ellipse(5, 3 - armAnimationOffset, 3, 3);

    // Pants
    this.p.fill(pantsColor.r, pantsColor.g, pantsColor.b);
    this.p.ellipse(0, 6, 4, 3);

    // Cane
    this.p.stroke(70, 50, 30);
    this.p.strokeWeight(0.8);
    this.p.noFill();
    this.p.line(3, 5, 4, 9);
    this.p.arc(4, 9, 1, 2, this.p.PI * 0.1, this.p.PI * 1.2);

    this.p.pop();

    // If showing a speech bubble
    if (showSpeechBubble && !!quote) {
      this.drawSpeechBubble(quote);
    }
  }

  drawSpeechBubble(quote: string) {
    this.p.push();
    this.p.translate(0, -18);

    // Bubble
    this.p.stroke(220);
    this.p.strokeWeight(0.8);
    this.p.fill(255, 255, 255, 240);
    this.p.rect(-30, -16, 60, 20, 8);

    // Pointer
    this.p.noStroke();
    this.p.fill(255, 255, 255, 240);
    this.p.triangle(-2, 4, 2, 4, 0, 12);

    // Text
    this.p.fill(50, 40, 50);
    this.p.textSize(8);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);

    // Wrap text if long
    let wrapped = quote.length > 24
      ? [quote.slice(0, 24) + (quote.length > 48 ? '…' : ''), quote.slice(24, 48)]
      : [quote];

    this.p.text(wrapped[0], 0, -8);
    if (wrapped[1]) this.p.text(wrapped[1], 0, 2);

    this.p.pop();
  }
}
