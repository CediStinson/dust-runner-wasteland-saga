
import p5 from 'p5';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { 
  isNightTime, 
  updateTimeOfDay 
} from './TimeSystem';
import {
  startSleeping,
  updateSleeping,
  endSleeping,
  renderSleepAnimation 
} from '../player/SleepSystem';

export class TimeManager {
  p: any;
  timeOfDay: number;
  dayLength: number;
  nightLength: number;
  dayTimeIcon: string;
  dayTimeAngle: number;
  dayTint: { r: number; g: number; b: number; a: number; };
  sleepingInHut: boolean;
  sleepStartTime: number;
  sleepAnimationTimer: number;
  sleepParticles: Array<{x: number, y: number, z: number, opacity: number, yOffset: number, size: number}>;
  
  constructor(p: any) {
    this.p = p;
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayLength = 60 * 60 * 5; // 5 minutes in frames (at 60fps)
    this.nightLength = 60 * 60 * 5; // 5 minutes in frames
    this.dayTimeIcon = "sun"; // Start with the sun
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2; // Calculate initial angle
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 }; // Default tint (no tint)
    this.sleepingInHut = false;
    this.sleepStartTime = 0;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
  }
  
  update(player: Player, hoverbike: Hoverbike): void {
    // Update time of day
    const timeUpdate = updateTimeOfDay(this.p, this.timeOfDay, this.dayLength, this.nightLength);
    this.timeOfDay = timeUpdate.timeOfDay;
    this.dayTimeIcon = timeUpdate.dayTimeIcon;
    this.dayTimeAngle = timeUpdate.dayTimeAngle;
    this.dayTint = timeUpdate.dayTint;
    
    // Handle sleeping in hut logic
    if (this.sleepingInHut) {
      const sleepUpdate = updateSleeping(
        this.p, 
        this.timeOfDay, 
        this.sleepAnimationTimer, 
        this.sleepParticles
      );
      
      this.timeOfDay = sleepUpdate.timeOfDay;
      this.sleepAnimationTimer = sleepUpdate.sleepAnimationTimer;
      this.sleepParticles = sleepUpdate.sleepParticles;
      
      if (sleepUpdate.shouldEndSleep) {
        this.sleepingInHut = false;
        endSleeping(this.p, player, hoverbike);
      }
    }
  }
  
  startSleeping(): void {
    const sleepState = startSleeping(this.p, this.timeOfDay);
    this.sleepingInHut = sleepState.sleepingInHut;
    this.sleepStartTime = sleepState.sleepStartTime;
    this.sleepAnimationTimer = sleepState.sleepAnimationTimer;
    this.sleepParticles = sleepState.sleepParticles;
  }
  
  setSleepingInHut(value: boolean): void {
    this.sleepingInHut = value;
  }
  
  setDayTimeIcon(icon: string): void {
    this.dayTimeIcon = icon;
  }
  
  setDayTimeAngle(angle: number): void {
    this.dayTimeAngle = angle;
  }
  
  isNightTime(): boolean {
    return isNightTime(this.timeOfDay);
  }
  
  renderSleepAnimation(): void {
    renderSleepAnimation(this.p, this.sleepParticles);
  }
  
  renderDayNightTint(): void {
    this.p.push();
    this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
    this.p.noStroke();
    this.p.rect(0, 0, this.p.width, this.p.height);
    this.p.pop();
  }
}
