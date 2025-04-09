import p5 from 'p5';
import Player from '../entities/Player';
import Hoverbike from '../entities/Hoverbike';
import WorldGenerator from '../world/WorldGenerator';
import GameRenderer from '../rendering/GameRenderer';
import { emitGameStateUpdate } from '../utils/gameUtils';

export default class Game {
  p: any;
  player: Player;
  hoverbike: Hoverbike;
  worldGenerator: WorldGenerator;
  renderer: GameRenderer;
  worldX: number;
  worldY: number;
  riding: boolean;
  timeOfDay: number;
  dayLength: number; // In frames
  nightLength: number; // In frames
  gameStarted: boolean;
  dayTimeIcon: string; // "sun" or "moon"
  dayTimeAngle: number; // Position on the circle
  exploredAreas: Set<string>; // Track explored areas
  dayTint: { r: number; g: number; b: number; a: number };
  sleepingInHut: boolean;
  sleepStartTime: number;
  sleepAnimationTimer: number;
  sleepParticles: Array<{x: number, y: number, z: number, opacity: number, yOffset: number, size: number}>;
  tarpColor: { r: number; g: number; b: number; };

  constructor(p: any) {
    this.p = p;
    this.worldX = 0;
    this.worldY = 0;
    this.riding = false;
    this.timeOfDay = 0.25; // Start at sunrise
    this.dayLength = 60 * 60 * 5; // 5 minutes in frames (at 60fps)
    this.nightLength = 60 * 60 * 5; // 5 minutes in frames
    this.gameStarted = false;
    this.dayTimeIcon = "sun"; // Start with the sun
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2; // Calculate initial angle
    this.exploredAreas = new Set<string>(); // Initialize empty set of explored areas
    this.dayTint = { r: 255, g: 255, b: 255, a: 0 }; // Default tint (no tint)
    this.sleepingInHut = false;
    this.sleepStartTime = 0;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    // Generate random tarp color in brown/red/green tones
    this.tarpColor = this.generateTarpColor();
    
    this.worldGenerator = new WorldGenerator(p);
    
    // Initialize player and hoverbike with references to each other
    // We need to create placeholder objects first
    this.player = {} as Player;
    this.hoverbike = {} as Hoverbike;
    
    // Now fully initialize them with proper references
    this.player = new Player(
      p, 
      p.width / 2, 
      p.height / 2 - 50, 
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(), 
      this.worldGenerator.getResources(),
      this.hoverbike,
      this.riding
    );
    
    // Position the hoverbike under the tarp (slightly to the left of the hut)
    this.hoverbike = new Hoverbike(
      p, 
      p.width / 2 - 120, // Position under the tarp
      p.height / 2 - 50, // Align with the hut's y position
      this.worldX, 
      this.worldY, 
      this.worldGenerator.getObstacles(),
      this.player
    );
    
    // Update player to reference the proper hoverbike
    this.player.hoverbike = this.hoverbike;
    
    this.renderer = new GameRenderer(
      p,
      this.worldGenerator,
      this.player,
      this.hoverbike,
      this.worldX,
      this.worldY,
      this.timeOfDay
    );
    
    // Generate the initial area
    this.worldGenerator.generateNewArea(0, 0);
    this.exploredAreas.add('0,0'); // Mark initial area as explored
    
    // Initialize UI values
    emitGameStateUpdate(this.player, this.hoverbike);
    
    // Add the fuel station at home base
    this.addFuelStationAtHomeBase();
    
    // Add the tarp at home base
    this.addTarpAtHomeBase();
    
    // Add walking marks
    this.addWalkingMarksAtHomeBase();
  }

  generateTarpColor() {
    // Generate random color in brown/red/green dark tones
    const colorType = Math.floor(Math.random() * 3); // 0: brown, 1: dark red, 2: dark green
    
    let r, g, b;
    
    switch (colorType) {
      case 0: // Brown tones
        r = Math.floor(Math.random() * 80) + 80; // 80-160
        g = Math.floor(Math.random() * 60) + 40; // 40-100
        b = Math.floor(Math.random() * 30) + 20; // 20-50
        break;
      case 1: // Dark red tones
        r = Math.floor(Math.random() * 70) + 120; // 120-190
        g = Math.floor(Math.random() * 30) + 30; // 30-60
        b = Math.floor(Math.random() * 30) + 30; // 30-60
        break;
      case 2: // Dark green tones
        r = Math.floor(Math.random() * 40) + 30; // 30-70
        g = Math.floor(Math.random() * 50) + 70; // 70-120
        b = Math.floor(Math.random() * 30) + 20; // 20-50
        break;
    }
    
    return { r, g, b };
  }

  addTarpAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add tarp if it doesn't exist
    const hasTarp = homeObstacles.some(obs => obs.type === 'tarp');
    
    if (!hasTarp) {
      homeObstacles.push({
        type: 'tarp',
        x: this.p.width / 2 - 120, // To the left of the hut
        y: this.p.height / 2 - 50, // Align with the hut
        width: 100,
        height: 80,
        color: this.tarpColor,
        zIndex: 1000 // Very high z-index to ensure it renders above everything else
      });
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  addFuelStationAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add fuel pump if it doesn't exist
    const hasFuelPump = homeObstacles.some(obs => obs.type === 'fuelPump');
    
    if (!hasFuelPump) {
      // Add fuel stains first (so they render underneath)
      // Create multiple fixed stains with different seed angles
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 45, // Slightly offset from the pump
        seedAngle: 0.5,
        size: 1.2
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 110,
        y: this.p.height / 2 - 40,
        seedAngle: 2.1,
        size: 0.9
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 95,
        y: this.p.height / 2 - 55,
        seedAngle: 4.2,
        size: 1.0
      });
      
      // Add more fuel stains in a wider area to represent the extended refueling zone
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 130,
        y: this.p.height / 2 - 50,
        seedAngle: 3.3,
        size: 0.8
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 85,
        y: this.p.height / 2 - 70,
        seedAngle: 1.7,
        size: 0.7
      });
      
      // Add even more stains to indicate the larger refueling area
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 150,
        y: this.p.height / 2 - 60,
        seedAngle: 5.2,
        size: 0.6
      });
      
      homeObstacles.push({
        type: 'fuelStain',
        x: this.p.width / 2 + 70,
        y: this.p.height / 2 - 90,
        seedAngle: 2.5,
        size: 0.75
      });
      
      // Add fuel pump without stains now (stains are separate objects)
      homeObstacles.push({
        type: 'fuelPump',
        x: this.p.width / 2 + 100,
        y: this.p.height / 2 - 50,
        size: 1.0,
      });
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  addWalkingMarksAtHomeBase() {
    const homeAreaKey = "0,0";
    let homeObstacles = this.worldGenerator.getObstacles()[homeAreaKey] || [];
    
    // Add walking marks
    const hasWalkingMarks = homeObstacles.some(obs => obs.type === 'walkingMarks');
    
    if (!hasWalkingMarks) {
      // Add multiple footprint sets in a pattern approaching the home base
      // Use fixed positions for stability
      const walkingMarkPositions = [
        { x: this.p.width / 2 - 80, y: this.p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170 },
        { x: this.p.width / 2 + 45, y: this.p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150 },
        { x: this.p.width / 2 - 30, y: this.p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190 },
        { x: this.p.width / 2 + 80, y: this.p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160 },
        { x: this.p.width / 2 - 60, y: this.p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180 }
      ];
      
      for (const position of walkingMarkPositions) {
        homeObstacles.push({
          type: 'walkingMarks',
          ...position
        });
      }
      
      // Update the world generator's obstacles
      this.worldGenerator.getObstacles()[homeAreaKey] = homeObstacles;
    }
  }

  update() {
    if (!this.gameStarted) {
      return;
    }
    
    // Update time of day
    this.updateTimeOfDay();
    
    // Handle sleeping in hut logic
    if (this.sleepingInHut) {
      this.updateSleeping();
      return; // Skip other updates while sleeping
    }
    
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.update();
    }
    
    this.player.update();
    
    // Check if player is entering the hut at night
    if (!this.riding && this.worldX === 0 && this.worldY === 0) {
      if (this.player.checkForHutSleeping() && this.isNightTime()) {
        this.startSleeping();
      }
    }
    
    this.checkBorder();
    this.worldGenerator.updateWindmillAngle();
    
    // Render fuel canisters in the current area
    if (this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`]) {
      for (const obstacle of this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`]) {
        if (obstacle.type === 'fuelCanister' && !obstacle.collected) {
          // Don't attempt to render here, we'll let the renderer handle it
          // The issue was trying to render here instead of in GameRenderer
        }
      }
    }
    
    // Update renderer with time of day
    this.renderer.setTimeOfDay(this.timeOfDay);
  }
  
  renderWeatheredCanister(x: number, y: number) {
    // This method was causing issues by rendering in the wrong place
    // We'll move canister rendering to GameRenderer instead
  }
  
  isNightTime() {
    // Return true if it's night (between sunset and sunrise)
    return this.timeOfDay < 0.25 || this.timeOfDay > 0.75;
  }
  
  startSleeping() {
    this.sleepingInHut = true;
    this.sleepStartTime = this.timeOfDay;
    this.sleepAnimationTimer = 0;
    this.sleepParticles = [];
    
    // Create initial sleep particles (Zs)
    this.createSleepParticles();
  }
  
  createSleepParticles() {
    // Create Z particles
    for (let i = 0; i < 3; i++) {
      this.sleepParticles.push({
        x: this.p.width / 2,
        y: this.p.height / 2 - 20,
        z: i * 30,
        opacity: 255,
        yOffset: 0,
        size: 16 + i * 4
      });
    }
  }
  
  updateSleeping() {
    // Accelerate time while sleeping
    this.timeOfDay += 0.005; // Much faster time progression (x20 normal speed)
    if (this.timeOfDay > 1) this.timeOfDay -= 1; // Wrap around if needed
    
    // Update sleep animation
    this.sleepAnimationTimer++;
    
    // Update Z particles
    for (let i = this.sleepParticles.length - 1; i >= 0; i--) {
      const particle = this.sleepParticles[i];
      particle.z += 0.5;
      particle.yOffset -= 0.5;
      particle.opacity -= 1;
      
      // Remove faded particles and create new ones periodically
      if (particle.opacity <= 0) {
        this.sleepParticles.splice(i, 1);
      }
    }
    
    // Create new particles periodically
    if (this.sleepAnimationTimer % 40 === 0) {
      this.createSleepParticles();
    }
    
    // End sleeping when it's morning
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.3) {
      this.endSleeping();
    }
  }
  
  endSleeping() {
    this.sleepingInHut = false;
    // Position the player in front of the hut
    this.player.x = this.p.width / 2;
    this.player.y = this.p.height / 2 + 30; // In front of the hut
    
    // Restore some health to the player
    this.player.health = Math.min(this.player.health + 30, this.player.maxHealth);
    
    // Update UI
    emitGameStateUpdate(this.player, this.hoverbike);
  }

  updateTimeOfDay() {
    // Calculate total day-night cycle length
    const totalCycleLength = this.dayLength + this.nightLength;
    
    // Increment timeOfDay
    const increment = 1 / totalCycleLength;
    this.timeOfDay = (this.timeOfDay + increment) % 1;
    
    // Update time of day icon and angle
    // Convert time to angle (0 = midnight, 0.5 = noon)
    this.dayTimeAngle = this.timeOfDay * Math.PI * 2;
    
    // Determine if it's day or night
    if (this.timeOfDay > 0.25 && this.timeOfDay < 0.75) {
      this.dayTimeIcon = "sun";
    } else {
      this.dayTimeIcon = "moon";
    }
    
    // Update the day/night tint color
    this.updateDayTint();
  }
  
  updateDayTint() {
    // Calculate tint based on time of day with more extreme values
    // 0.0 = midnight, 0.25 = sunrise, 0.5 = noon, 0.75 = sunset
    
    if (this.timeOfDay >= 0.0 && this.timeOfDay < 0.25) {
      // Night to sunrise transition (dark blue to orange)
      const t = this.timeOfDay / 0.25; // 0 to 1
      this.dayTint = {
        r: this.p.lerp(20, 255, t),  // Darker blue to bright orange
        g: this.p.lerp(25, 160, t),
        b: this.p.lerp(40, 70, t),
        a: this.p.lerp(70, 30, t)    // More opacity at night
      };
    } 
    else if (this.timeOfDay >= 0.25 && this.timeOfDay < 0.5) {
      // Sunrise to noon (orange to clear blue sky)
      const t = (this.timeOfDay - 0.25) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 150, t),
        g: this.p.lerp(160, 200, t),
        b: this.p.lerp(70, 255, t),
        a: this.p.lerp(30, 0, t)     // Fade out completely at noon
      };
    }
    else if (this.timeOfDay >= 0.5 && this.timeOfDay < 0.75) {
      // Noon to sunset (clear blue to orange)
      const t = (this.timeOfDay - 0.5) / 0.25;
      this.dayTint = {
        r: this.p.lerp(150, 255, t),
        g: this.p.lerp(200, 130, t),
        b: this.p.lerp(255, 70, t),
        a: this.p.lerp(0, 30, t)     // Gradually increase tint
      };
    }
    else {
      // Sunset to night (orange to dark blue)
      const t = (this.timeOfDay - 0.75) / 0.25;
      this.dayTint = {
        r: this.p.lerp(255, 20, t),  // Fade to darker night
        g: this.p.lerp(130, 25, t),
        b: this.p.lerp(70, 40, t),
        a: this.p.lerp(30, 70, t)    // Increase opacity for darker night
      };
    }
  }

  render() {
    if (!this.gameStarted) {
      this.renderMainMenu();
    } else {
      // Render the world first
      this.renderer.render();
      
      // Render sleep animation if sleeping
      if (this.sleepingInHut) {
        this.renderSleepAnimation();
      }
      
      // Apply the day/night tint as an overlay
      this.p.push();
      this.p.fill(this.dayTint.r, this.dayTint.g, this.dayTint.b, this.dayTint.a);
      this.p.noStroke();
      this.p.rect(0, 0, this.p.width, this.p.height);
      this.p.pop();
    }
  }
  
  renderSleepAnimation() {
    // Darken the screen
    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.noStroke();
    this.p.rect(0, 0, this.p.width, this.p.height);
    
    // Render Z particles
    this.p.textSize(24);
    this.p.textAlign(this.p.CENTER, this.p.CENTER);
    this.p.fill(255);
    this.p.noStroke();
    
    for (const particle of this.sleepParticles) {
      this.p.push();
      this.p.textSize(particle.size);
      this.p.fill(255, 255, 255, particle.opacity);
      this.p.text("Z", particle.x + particle.z, particle.y + particle.yOffset);
      this.p.pop();
    }
    
    // Show sleeping message
    this.p.textSize(18);
    this.p.fill(255);
    this.p.text("Sleeping until morning...", this.p.width/2, this.p.height/2 + 150);
    
    this.p.pop();
  }

  renderMainMenu() {
    // Draw background
    this.p.background(20, 18, 24);
    
    // Draw stars
    this.p.fill(255, 255, 255);
    for (let i = 0; i < 100; i++) {
      const x = this.p.random(this.p.width);
      const y = this.p.random(this.p.height);
      const size = this.p.random(1, 3);
      const brightness = this.p.random(150, 255);
      this.p.fill(brightness);
      this.p.ellipse(x, y, size, size);
    }
    
    // Draw large desert dune silhouette
    this.p.fill(50, 30, 20);
    this.p.beginShape();
    this.p.vertex(0, this.p.height);
    this.p.vertex(0, this.p.height * 0.7);
    for (let x = 0; x <= this.p.width; x += 50) {
      const y = this.p.height * 0.7 + this.p.sin(x * 0.01) * 50;
      this.p.vertex(x, y);
    }
    this.p.vertex(this.p.width, this.p.height);
    this.p.endShape(this.p.CLOSE);
    
    // Draw title text with glow effect
    const titleText = "DUST RUNNER: WASTELAND SAGA";
    this.p.textSize(42);
    this.p.textAlign(this.p.CENTER);
    this.p.textFont('Courier New');
    
    // Glow effect
    this.p.fill(255, 220, 150, 30);
    for (let i = 10; i > 0; i--) {
      this.p.text(titleText, this.p.width/2, this.p.height/3 + i);
      this.p.text(titleText, this.p.width/2 + i, this.p.height/3);
      this.p.text(titleText, this.p.width/2 - i, this.p.height/3);
    }
    
    // Main text
    this.p.fill(255, 220, 150);
    this.p.text(titleText, this.p.width/2, this.p.height/3);
    
    // Draw start button
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = this.p.width/2 - btnWidth/2;
    const btnY = this.p.height/2 + 30;
    
    const mouseOver = this.p.mouseX > btnX && this.p.mouseX < btnX + btnWidth && 
                      this.p.mouseY > btnY && this.p.mouseY < btnY + btnHeight;
                      
    if (mouseOver) {
      this.p.fill(255, 220, 150);
      if (this.p.mouseIsPressed) {
        this.gameStarted = true;
      }
    } else {
      this.p.fill(200, 170, 100);
    }
    
    this.p.rect(btnX, btnY, btnWidth, btnHeight, 5);
    this.p.fill(40, 30, 20);
    this.p.textSize(24);
    this.p.text("START GAME", this.p.width/2, btnY + 32);
    
    // Draw subtitle text
    this.p.fill(200, 180, 150);
    this.p.textSize(16);
    this.p.text("Survive the harsh desert. Collect resources. Upgrade your hoverbike.", this.p.width/2, this.p.height/2 - 20);
  }

  checkBorder() {
    if (this.player.x > this.p.width) {
      this.worldX++;
      this.player.x = 0;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.x = this.player.x;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
    } else if (this.player.x < 0) {
      this.worldX--;
      this.player.x = this.p.width;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.x = this.player.x;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
    }
    
    if (this.player.y > this.p.height) {
      this.worldY++;
      this.player.y = 0;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.y = this.player.y;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
    } else if (this.player.y < 0) {
      this.worldY--;
      this.player.y = this.p.height;
      this.player.setWorldCoordinates(this.worldX, this.worldY);
      
      if (this.riding) {
        this.hoverbike.y = this.player.y;
        this.hoverbike.setWorldCoordinates(this.worldX, this.worldY);
      }
      
      this.renderer.setWorldCoordinates(this.worldX, this.worldY);
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(`${this.worldX},${this.worldY}`); // Mark as explored
    }
  }

  handleKey(key: string) {
    if (!this.gameStarted) {
      if (key === ' ' || key === 'Enter') {
        this.gameStarted = true;
      }
      return;
    }
    
    if (key === 'f' || key === 'F') {
      if (this.riding) {
        this.riding = false;
        this.player.setRiding(false);
      } else if (this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
                this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
        this.riding = true;
        this.player.setRiding(true);
      }
    }
    
    if (key === 'r' && !this.riding && 
        this.p.dist(this.player.x, this.player.y, this.hoverbike.x, this.hoverbike.y) < 30 && 
        this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY &&
        this.isPlayerUnderTarp() && // Only allow repairs under tarp
        this.player.inventory.metal > 0) { // Only if player has metal
      // Start the repair process
      this.player.startHoverbikeRepair();
      this.hoverbike.startRepairAnimation();
    }
  }

  resize() {
    this.worldGenerator.clearTextures();
    this.worldGenerator.generateNewArea(this.worldX, this.worldY);
  }
  
  handleClick(mouseX: number, mouseY: number) {
    // Handle clicks in main menu
    if (!this.gameStarted) {
      // Check if start button is clicked
      const btnWidth = 200;
      const btnHeight = 50;
      const btnX = this.p.width/2 - btnWidth/2;
      const btnY = this.p.height/2 + 30;
      
      if (mouseX > btnX && mouseX < btnX + btnWidth && 
          mouseY > btnY && mouseY < btnY + btnHeight) {
        this.gameStarted = true;
      }
    }
  }

  getWorldData() {
    const exploredAreasArray = Array.from(this.exploredAreas);
    const obstacles = {};
    const resources = {};
    
    // Only save data for explored areas
    for (const areaKey of exploredAreasArray) {
      if (this.worldGenerator.getObstacles()[areaKey]) {
        obstacles[areaKey] = this.worldGenerator.getObstacles()[areaKey];
      }
      if (this.worldGenerator.getResources()[areaKey]) {
        resources[areaKey] = this.worldGenerator.getResources()[areaKey];
      }
    }
    
    return {
      exploredAreas: exploredAreasArray,
      obstacles,
      resources
    };
  }
  
  loadWorldData(worldData: any) {
    if (!worldData) return;
    
    // Restore explored areas
    this.exploredAreas = new Set(worldData.exploredAreas || []);
    
    // Restore obstacles and resources
    if (worldData.obstacles) {
      for (const areaKey in worldData.obstacles) {
        this.worldGenerator.getObstacles()[areaKey] = worldData.obstacles[areaKey];
      }
    }
    
    if (worldData.resources) {
      for (const areaKey in worldData.resources) {
        this.worldGenerator.getResources()[areaKey] = worldData.resources[areaKey];
      }
    }
    
    // Ensure the current area is properly loaded
    const currentAreaKey = `${this.worldX},${this.worldY}`;
    if (!this.worldGenerator.getObstacles()[currentAreaKey]) {
      this.worldGenerator.generateNewArea(this.worldX, this.worldY);
      this.exploredAreas.add(currentAreaKey);
    }
  }
  
  resetToStartScreen() {
    // Clean up any active events or intervals
    if (this.player) {
      this.player.isCollectingCanister = false;
      this.player.isRefuelingHoverbike = false;
      this.player.isRepairingHoverbike = false;
    }
    this.sleepingInHut = false;
    this.gameStarted = false;
  }

  isPlayerUnderTarp() {
    if (this.worldX !== 0 || this.worldY !== 0) {
      return false; // Only at home base
    }
    
    const homeObstacles = this.worldGenerator.getObstacles()["0,0"] || [];
    const tarp = homeObstacles.find(obs => obs.type === 'tarp');
    
    if (!tarp) {
      return false;
    }
    
    // Check if player is under the tarp
    return (
      this.player.x >= tarp.x - tarp.width / 2 &&
      this.player.x <= tarp.x + tarp.width / 2 &&
      this.player.y >= tarp.y - tarp.height / 2 &&
      this.player.y <= tarp.y + tarp.height / 2
    );
  }
}
