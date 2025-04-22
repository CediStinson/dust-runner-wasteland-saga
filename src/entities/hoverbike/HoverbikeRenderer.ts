
import p5 from 'p5';
import { HoverbikeState, RepairAnimationState } from '../../types/HoverbikeTypes';

export class HoverbikeRenderer {
  private p: any;
  private bikeSprite: any;

  constructor(p: any) {
    this.p = p;
    this.bikeSprite = this.p.loadImage('src/pixelartAssets/hoverbike.png');
  }

  display(state: HoverbikeState, player: any, repairAnimation: RepairAnimationState) {
    if (state.worldX === player.worldX && state.worldY === player.worldY) {
      this.p.push();
      this.p.translate(state.x, state.y);
      
      // Rotate 90 degrees anti-clockwise (270 degrees)
      this.p.rotate(state.angle - this.p.HALF_PI);
      
      // Draw hoverbike sprite at 16x32 dimensions
      this.p.image(this.bikeSprite, -8, -16, 16, 32);
      
      if (state.thrustIntensity > 0) {
        this.drawThrustFlame(state.thrustIntensity);
      }
      
      this.p.pop();
      
      this.displayRepairEffects(state, repairAnimation);
    }
  }

  private drawThrustFlame(intensity: number) {
    const flameWidth = intensity;
    const flameHeight = 6;
    const flameX = -21 - (flameWidth / 2);
    
    this.p.noStroke();
    
    this.p.fill(255, 150, 50, 150 + Math.sin(this.p.frameCount * 0.2) * 50);
    this.p.ellipse(flameX, 0, flameWidth, flameHeight);
    
    this.p.fill(255, 200, 100, 100 + Math.sin(this.p.frameCount * 0.2) * 50);
    this.p.ellipse(flameX - 1, 0, flameWidth * 0.7, flameHeight * 0.8);
    
    this.p.fill(255, 50, 50, 200 + Math.sin(this.p.frameCount * 0.3) * 55);
    this.p.ellipse(flameX - 2, 0, flameWidth * 0.5, flameHeight * 0.6);
  }

  displayRepairEffects(state: HoverbikeState, repairAnimation: RepairAnimationState) {
    if (!repairAnimation.active) return;
    
    this.p.push();
    this.p.fill(200, 200, 100);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(10);
    this.p.text("Repairing...", state.x, state.y - 25);
    this.p.pop();
  }
}
