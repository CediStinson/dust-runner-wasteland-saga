
import { emitGameStateUpdate } from '../../utils/gameUtils';

export interface SleepParticle {
  x: number;
  y: number;
  z: number;
  opacity: number;
  yOffset: number;
  size: number;
}

export function startSleeping(p: any, timeOfDay: number): {
  sleepingInHut: boolean;
  sleepStartTime: number;
  sleepAnimationTimer: number;
  sleepParticles: SleepParticle[];
} {
  return {
    sleepingInHut: true,
    sleepStartTime: timeOfDay,
    sleepAnimationTimer: 0,
    sleepParticles: createInitialSleepParticles(p)
  };
}

export function createInitialSleepParticles(p: any): SleepParticle[] {
  // Create Z particles
  const particles: SleepParticle[] = [];
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: p.width / 2,
      y: p.height / 2 - 20,
      z: i * 30,
      opacity: 255,
      yOffset: 0,
      size: 16 + i * 4
    });
  }
  return particles;
}

export function updateSleeping(
  p: any, 
  timeOfDay: number, 
  sleepAnimationTimer: number, 
  sleepParticles: SleepParticle[]
): {
  timeOfDay: number;
  sleepAnimationTimer: number;
  sleepParticles: SleepParticle[];
  shouldEndSleep: boolean;
} {
  // Accelerate time while sleeping
  const newTimeOfDay = (timeOfDay + 0.005) % 1; // Much faster time progression (x20 normal speed)
  
  // Update sleep animation
  const newSleepAnimationTimer = sleepAnimationTimer + 1;
  
  // Update Z particles
  const updatedParticles = [...sleepParticles];
  for (let i = updatedParticles.length - 1; i >= 0; i--) {
    const particle = updatedParticles[i];
    particle.z += 0.5;
    particle.yOffset -= 0.5;
    particle.opacity -= 1;
    
    // Remove faded particles
    if (particle.opacity <= 0) {
      updatedParticles.splice(i, 1);
    }
  }
  
  // Create new particles periodically
  let newParticles = [...updatedParticles];
  if (newSleepAnimationTimer % 40 === 0) {
    newParticles = [...newParticles, ...createInitialSleepParticles(p)];
  }
  
  // End sleeping when it's morning
  const shouldEndSleep = newTimeOfDay > 0.25 && newTimeOfDay < 0.3;
  
  return {
    timeOfDay: newTimeOfDay,
    sleepAnimationTimer: newSleepAnimationTimer,
    sleepParticles: newParticles,
    shouldEndSleep
  };
}

export function endSleeping(p: any, player: any, hoverbike: any): void {
  // Position the player in front of the hut
  player.x = p.width / 2;
  player.y = p.height / 2 + 30; // In front of the hut
  
  // Restore some health to the player
  player.health = Math.min(player.health + 30, player.maxHealth);
  
  // Update UI
  emitGameStateUpdate(player, hoverbike);
}

export function renderSleepAnimation(p: any, sleepParticles: SleepParticle[]): void {
  // Darken the screen
  p.push();
  p.fill(0, 0, 0, 150);
  p.noStroke();
  p.rect(0, 0, p.width, p.height);
  
  // Render Z particles
  p.textSize(24);
  p.textAlign(p.CENTER, p.CENTER);
  p.fill(255);
  p.noStroke();
  
  for (const particle of sleepParticles) {
    p.push();
    p.textSize(particle.size);
    p.fill(255, 255, 255, particle.opacity);
    p.text("Z", particle.x + particle.z, particle.y + particle.yOffset);
    p.pop();
  }
  
  // Show sleeping message
  p.textSize(18);
  p.fill(255);
  p.text("Sleeping until morning...", p.width/2, p.height/2 + 150);
  
  p.pop();
}
