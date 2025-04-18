
export class PlayerAnimationService {
  updateArmAnimation(velX: number, velY: number, frameCount: number, digging: boolean): number {
    if (digging) {
      return Math.sin(frameCount * 0.2) * 1.5;
    } else if (Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
      return Math.sin(frameCount * 0.2) * 1.2;
    }
    return 0;
  }
}
