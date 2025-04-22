import p5 from 'p5';

export class PlayerRenderer {
  private p: any;
  private playerSprite: any;
  private playerRidingSprite: any;
  
  constructor(p: any) {
    this.p = p;
    // Load both player sprites in constructor
    this.playerSprite = this.p.loadImage('src/pixelartAssets/player_character.png');
    this.playerRidingSprite = this.p.loadImage('src/pixelartAssets/player_character_riding.png');
  }
  
  displayPlayer(
    riding: boolean,
    carryingFuelCanister: boolean,
    armAnimationOffset: number,
    hairColor: { r: number, g: number, b: number }
  ): void {
    this.p.push();
    
    if (riding) {
      // Draw riding sprite state at 16x16
      this.p.image(this.playerRidingSprite, -8, -8, 16, 16);
    } else {
      // Draw standing sprite with slight bob from arm animation at 16x16
      this.p.image(this.playerSprite, -8, -8 + armAnimationOffset, 16, 16);
      
      if (carryingFuelCanister) {
        this.displayFuelCanister();
      }
    }
    
    this.p.pop();
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
