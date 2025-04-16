
import p5 from 'p5';
import { HoverbikeState, RepairAnimationState } from '../../types/HoverbikeTypes';

export class HoverbikeRenderer {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  display(state: HoverbikeState, player: any, repairAnimation: RepairAnimationState) {
    if (state.worldX === player.worldX && state.worldY === player.worldY) {
      this.p.push();
      this.p.translate(state.x, state.y);
      this.p.rotate(state.angle);
      
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.fill(130, 130, 140);
      this.p.beginShape();
      this.p.vertex(20, 0);
      this.p.vertex(16, 6);
      this.p.vertex(0, 8);
      this.p.vertex(-16, 6);
      this.p.vertex(-16, -6);
      this.p.vertex(0, -8);
      this.p.vertex(16, -6);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(80, 80, 90);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.beginShape();
      this.p.vertex(14, 0);
      this.p.vertex(10, 5);
      this.p.vertex(-6, 6);
      this.p.vertex(-10, 4);
      this.p.vertex(-10, -4);
      this.p.vertex(-6, -6);
      this.p.vertex(10, -5);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(60, 60, 65);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.ellipse(0, 0, 14, 10);
      
      this.p.stroke(70, 70, 75);
      this.p.strokeWeight(2);
      this.p.line(8, -4, 6, -8);
      this.p.line(8, 4, 6, 8);
      this.p.strokeWeight(1);
      
      this.p.fill(40, 40, 45);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.ellipse(6, -8, 4, 3);
      this.p.ellipse(6, 8, 4, 3);
      
      this.p.fill(200, 200, 100);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.ellipse(18, 0, 6, 3);
      
      this.p.fill(90, 90, 95);
      this.p.stroke(0);
      this.p.strokeWeight(1);
      this.p.beginShape();
      this.p.vertex(-14, -6);
      this.p.vertex(-14, 6);
      this.p.vertex(-20, 5);
      this.p.vertex(-20, -5);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(50, 50, 55);
      this.p.stroke(0);
      this.p.strokeWeight(0.5);
      this.p.rect(-15, -4, 4, 8, 1);
      
      if (state.thrustIntensity > 0) {
        const flameWidth = state.thrustIntensity;
        const flameHeight = 6;
        const flameX = -21 - (flameWidth / 2);
        
        this.p.noStroke();
        
        this.p.fill(255, 150, 50, 150 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(flameX, 0, flameWidth, flameHeight);
        
        this.p.fill(255, 200, 100, 100 + this.p.sin(this.p.frameCount * 0.2) * 50);
        this.p.ellipse(flameX - 1, 0, flameWidth * 0.7, flameHeight * 0.8);
        
        this.p.fill(255, 50, 50, 200 + this.p.sin(this.p.frameCount * 0.3) * 55);
        this.p.ellipse(flameX - 2, 0, flameWidth * 0.5, flameHeight * 0.6);
      }
      
      this.p.stroke(0);
      this.p.fill(100, 100, 110);
      this.p.beginShape();
      this.p.vertex(-5, -8);
      this.p.vertex(0, -10);
      this.p.vertex(5, -8);
      this.p.endShape(this.p.CLOSE);
      
      this.p.beginShape();
      this.p.vertex(-5, 8);
      this.p.vertex(0, 10);
      this.p.vertex(5, 8);
      this.p.endShape(this.p.CLOSE);
      
      this.p.fill(60, 60, 65);
      this.p.stroke(0);
      this.p.strokeWeight(0.5);
      this.p.ellipse(-8, -8, 2, 2);
      this.p.ellipse(0, -8, 2, 2);
      this.p.ellipse(8, -8, 2, 2);
      this.p.ellipse(-8, 8, 2, 2);
      this.p.ellipse(0, 8, 2, 2);
      this.p.ellipse(8, 8, 2, 2);
      
      this.p.stroke(40, 40, 45);
      this.p.strokeWeight(1);
      this.p.line(-8, -6, -14, -4);
      this.p.line(-8, -2, -14, -2);
      this.p.line(-8, 2, -14, 2);
      this.p.line(-8, 6, -14, 4);
      
      this.p.noStroke();
      this.p.fill(50, 50, 60, 100);
      this.p.ellipse(0, 0, 25, 20);
      
      this.p.pop();
      
      this.displayRepairEffects(state, repairAnimation);
    }
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
