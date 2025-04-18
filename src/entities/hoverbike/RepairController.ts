
import p5 from 'p5';
import { RepairAnimationState } from '../../types/HoverbikeTypes';

export class RepairController {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  startRepairAnimation(repairAnimation: RepairAnimationState): RepairAnimationState {
    return {
      active: true,
      timer: 0,
      sparks: []
    };
  }
  
  updateRepairAnimation(repairAnimation: RepairAnimationState): RepairAnimationState {
    const newState = { ...repairAnimation };
    newState.timer++;
    
    if (newState.timer % 3 === 0) {
      for (let i = 0; i < 4; i++) {
        const angle = this.p.random(0, Math.PI * 2);
        const distance = this.p.random(5, 15);
        newState.sparks.push({
          x: this.p.random(-12, 12),
          y: this.p.random(-12, 12),
          opacity: 255,
          vx: Math.cos(angle) * this.p.random(0.5, 3),
          vy: Math.sin(angle) * this.p.random(0.5, 3) - this.p.random(0.5, 2)
        });
      }
    }
    
    for (let i = newState.sparks.length - 1; i >= 0; i--) {
      const spark = newState.sparks[i];
      spark.x += spark.vx;
      spark.y += spark.vy;
      spark.opacity -= this.p.random(8, 20);
      
      if (spark.opacity <= 0) {
        newState.sparks.splice(i, 1);
      }
    }
    
    if (newState.timer >= 120) {
      newState.active = false;
    }
    
    return newState;
  }
}
