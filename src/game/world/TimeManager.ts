
import p5 from 'p5';
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';

export class TimeManager {
  p: any;
  timeOfDay: number;
  dayTimeIcon: string;
  dayTimeAngle: number;
  dayTint: { r: number; g: number; b: number; a: number; };
  sleepingInHut: boolean;
  sleepParticles: Array<{x: number, y: number, z: number, opacity: number, yOffset: number, size: number}>;
  sleepStartTime: number;
  dayNightCycleSpeed: number;
  
  constructor(p: any) {
    this.p = p;
    this.timeOfDay = 0.25; // Start at morning
    this.dayTimeIcon = "sun";
    this.dayTimeAngle = 0;
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 };
    this.sleepingInHut = false;
    this.sleepParticles = [];
    this.sleepStartTime = 0;
    this.dayNightCycleSpeed = 0.0001;
  }
  
  update(player: Player, hoverbike: Hoverbike): void {
    // Update time of day
    if (!this.sleepingInHut) {
      this.timeOfDay += this.p.deltaTime * this.dayNightCycleSpeed;
      if (this.timeOfDay >= 1) {
        this.timeOfDay = 0;
      }
    } else {
      this.updateSleeping();
    }
    
    this.updateDayTimeValues();
  }
  
  updateDayTimeValues(): void {
    // Update day time icon and angle based on time of day
    if (this.timeOfDay < 0.25) {
      // Morning
      this.dayTimeIcon = "sunrise";
      this.dayTimeAngle = this.p.map(this.timeOfDay, 0, 0.25, -90, 0);
    } else if (this.timeOfDay < 0.75) {
      // Day
      this.dayTimeIcon = "sun";
      this.dayTimeAngle = this.p.map(this.timeOfDay, 0.25, 0.75, 0, 180);
    } else {
      // Night
      this.dayTimeIcon = "moon";
      this.dayTimeAngle = this.p.map(this.timeOfDay, 0.75, 1, 180, 270);
    }
    
    // Update day tint based on time of day
    if (this.timeOfDay < 0.2 || this.timeOfDay > 0.8) {
      // Night
      const nightIntensity = this.timeOfDay < 0.2 
        ? this.p.map(this.timeOfDay, 0, 0.2, 0.7, 0) 
        : this.p.map(this.timeOfDay, 0.8, 1, 0, 0.7);
      this.dayTint = { 
        r: 20, 
        g: 30, 
        b: 100, 
        a: nightIntensity 
      };
    } else if (this.timeOfDay > 0.75) {
      // Sunset
      const sunsetIntensity = this.p.map(this.timeOfDay, 0.75, 0.8, 0, 0.3);
      this.dayTint = { 
        r: 255, 
        g: 140, 
        b: 50, 
        a: sunsetIntensity 
      };
    } else if (this.timeOfDay < 0.25) {
      // Sunrise
      const sunriseIntensity = this.p.map(this.timeOfDay, 0.2, 0.25, 0.3, 0);
      this.dayTint = { 
        r: 255, 
        g: 170, 
        b: 130, 
        a: sunriseIntensity 
      };
    } else {
      // Day
      this.dayTint = { r: 255, g: 255, b: 255, a: 0 };
    }
  }
  
  startSleeping(): void {
    if (!this.sleepingInHut) {
      this.sleepingInHut = true;
      this.sleepStartTime = Date.now();
      this.initSleepParticles();
    }
  }
  
  stopSleeping(): void {
    this.sleepingInHut = false;
  }
  
  setDayTimeIcon(icon: string): void {
    this.dayTimeIcon = icon;
  }
  
  setDayTimeAngle(angle: number): void {
    this.dayTimeAngle = angle;
  }
  
  updateSleeping(): void {
    if (!this.sleepingInHut) return;
    
    // Sleeping logic - fast forward time
    this.timeOfDay += this.p.deltaTime * 0.001;
    
    // Wake up in the morning
    if (this.timeOfDay > 0.2 && this.timeOfDay < 0.3) {
      // Check if we've been sleeping for at least 2 seconds in real time
      if (Date.now() - this.sleepStartTime > 2000) {
        this.stopSleeping();
      }
    }
    
    // Update sleep particles
    this.updateSleepParticles();
  }
  
  initSleepParticles(): void {
    this.sleepParticles = [];
    for (let i = 0; i < 50; i++) {
      this.sleepParticles.push({
        x: this.p.random(this.p.width),
        y: this.p.random(this.p.height / 2),
        z: this.p.random(1, 3),
        opacity: this.p.random(100, 200),
        yOffset: this.p.random(20),
        size: this.p.random(2, 6)
      });
    }
  }
  
  updateSleepParticles(): void {
    for (const particle of this.sleepParticles) {
      particle.x += particle.z * 0.5;
      particle.y = particle.y + Math.sin(Date.now() * 0.001 + particle.x * 0.1) * 0.5;
      
      if (particle.x > this.p.width) {
        particle.x = 0;
      }
    }
  }
  
  renderSleepAnimation(): void {
    // Draw black overlay
    this.p.fill(0, 0, 0, 150);
    this.p.noStroke();
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Draw Z particles
    this.p.textSize(24);
    for (const particle of this.sleepParticles) {
      this.p.fill(255, 255, 255, particle.opacity);
      this.p.text("z", particle.x, particle.y + particle.yOffset);
    }
    
    // Draw waking up text
    if (this.timeOfDay > 0.18 && this.timeOfDay < 0.22) {
      this.p.textAlign(this.p.CENTER);
      this.p.fill(255);
      this.p.textSize(20);
      this.p.text("Waking up...", this.p.width/2, this.p.height/2);
    }
  }
  
  renderDayNightTint(): void {
    if (this.dayTint.a > 0) {
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a * 255);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
    }
  }
  
  isNightTime(): boolean {
    return this.timeOfDay > 0.7 || this.timeOfDay < 0.2;
  }
}
