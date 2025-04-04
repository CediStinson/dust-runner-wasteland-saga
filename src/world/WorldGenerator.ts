
import p5 from 'p5';

export default class WorldGenerator {
  p: any;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  sandTextures: Record<string, any>;
  grassTextures: Record<string, any>;
  windmillAngle: number;

  constructor(p: any) {
    this.p = p;
    this.obstacles = {};
    this.resources = {};
    this.sandTextures = {};
    this.grassTextures = {};
    this.windmillAngle = 0;
  }

  updateWindmillAngle() {
    this.windmillAngle += 0.01;
    if (this.windmillAngle > this.p.TWO_PI) {
      this.windmillAngle -= this.p.TWO_PI;
    }
  }

  getWindmillAngle() {
    return this.windmillAngle;
  }

  getObstacles() {
    return this.obstacles;
  }

  getResources() {
    return this.resources;
  }

  getSandTexture(key: string) {
    return this.sandTextures[key];
  }

  getGrassTexture(key: string) {
    return this.grassTextures[key];
  }

  clearTextures() {
    this.sandTextures = {};
    this.grassTextures = {};
    // Note: We don't clear obstacles and resources to maintain the game state
  }

  generateNewArea(x: number, y: number) {
    return this.generateArea(x, y);
  }

  generateArea(x: number, y: number) {
    // Check if this area has already been generated
    const key = `${x},${y}`;
    if (this.obstacles[key]) {
      return;
    }

    // Initialize arrays for obstacles and resources
    this.obstacles[key] = [];
    this.resources[key] = [];

    // Create a sand texture for the background
    this.generateSandTexture(x, y);

    // If home base (0,0), create a hut
    if (x === 0 && y === 0) {
      this.generateHomeBase(x, y);
    } else {
      // Generate random obstacles based on location
      this.generateRandomObstacles(x, y);
    }

    // Generate resources (more common farther from home)
    const distanceFromHome = Math.sqrt(x * x + y * y);
    this.generateResources(x, y, distanceFromHome);
  }

  generateHomeBase(x: number, y: number) {
    const key = `${x},${y}`;
    
    // Create a hut in home area
    this.obstacles[key].push({
      type: 'hut',
      x: this.p.width / 2,
      y: this.p.height / 2
    });

    // Add some rocks and bushes around home
    const numRocks = this.p.random(3, 6);
    for (let i = 0; i < numRocks; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const distance = this.p.random(150, 250);
      const px = this.p.width / 2 + Math.cos(angle) * distance;
      const py = this.p.height / 2 + Math.sin(angle) * distance;
      
      this.obstacles[key].push({
        type: 'rock',
        x: px,
        y: py,
        size: this.p.random(1, 1.5),
        aspectRatio: this.p.random(0.7, 1.3),
        shape: this.generateRockShape()
      });
    }

    // Add some bushes
    const numBushes = this.p.random(2, 4);
    for (let i = 0; i < numBushes; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const distance = this.p.random(180, 280);
      const px = this.p.width / 2 + Math.cos(angle) * distance;
      const py = this.p.height / 2 + Math.sin(angle) * distance;
      
      this.obstacles[key].push({
        type: 'bush',
        x: px,
        y: py,
        size: this.p.random(0.8, 1.2),
        shape: this.generateBushShape()
      });
    }
    
    // Add some cactuses 
    const numCactus = this.p.random(2, 4);
    for (let i = 0; i < numCactus; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const distance = this.p.random(150, 280);
      const px = this.p.width / 2 + Math.cos(angle) * distance;
      const py = this.p.height / 2 + Math.sin(angle) * distance;
      
      this.obstacles[key].push({
        type: 'cactus',
        x: px,
        y: py,
        size: this.p.random(0.8, 1.2),
        shape: this.generateCactusShape()
      });
    }
    
    // Add some metal pieces scattered around home base
    const numMetal = 5; // Start with 5 metal pieces at home
    for (let i = 0; i < numMetal; i++) {
      const angle = this.p.random(this.p.TWO_PI);
      const distance = this.p.random(100, 200);
      const px = this.p.width / 2 + Math.cos(angle) * distance;
      const py = this.p.height / 2 + Math.sin(angle) * distance;
      
      this.resources[key].push({
        type: 'metal',
        x: px,
        y: py,
        size: this.p.random(0.8, 1.2),
        rotation: this.p.random(this.p.TWO_PI),
        buried: this.p.random(0.3, 0.7)
      });
    }
  }

  generateRandomObstacles(x: number, y: number) {
    const key = `${x},${y}`;
    
    // More cactai in all areas
    const numCactus = this.p.int(this.p.random(5, 10)); // Increased from 2-5
    for (let i = 0; i < numCactus; i++) {
      this.obstacles[key].push({
        type: 'cactus',
        x: this.p.random(this.p.width),
        y: this.p.random(this.p.height),
        size: this.p.random(0.8, 1.5),
        shape: this.generateCactusShape()
      });
    }

    // Rocks
    const numRocks = this.p.int(this.p.random(3, 8));
    for (let i = 0; i < numRocks; i++) {
      this.obstacles[key].push({
        type: 'rock',
        x: this.p.random(this.p.width),
        y: this.p.random(this.p.height),
        size: this.p.random(0.8, 2),
        aspectRatio: this.p.random(0.7, 1.3),
        shape: this.generateRockShape()
      });
    }

    // Bushes
    const numBushes = this.p.int(this.p.random(1, 4));
    for (let i = 0; i < numBushes; i++) {
      this.obstacles[key].push({
        type: 'bush',
        x: this.p.random(this.p.width),
        y: this.p.random(this.p.height),
        size: this.p.random(0.8, 1.2),
        shape: this.generateBushShape()
      });
    }
    
    // Add sand dunes in random areas too
    if (this.p.random() < 0.7) { // 70% chance for an area to have dunes
      const numDunes = this.p.int(this.p.random(2, 5));
      for (let i = 0; i < numDunes; i++) {
        this.obstacles[key].push({
          type: 'sandDune',
          x: this.p.random(this.p.width),
          y: this.p.random(this.p.height),
          angle: this.p.random(this.p.TWO_PI),
          length: this.p.random(150, 300),
          width: this.p.random(10, 25)
        });
      }
    }
  }

  generateResources(x: number, y: number, distanceFromHome: number) {
    const key = `${x},${y}`;
    
    // Metal scraps - more common
    const numMetal = this.p.int(this.p.random(1, 4 + distanceFromHome));
    for (let i = 0; i < numMetal; i++) {
      this.resources[key].push({
        type: 'metal',
        x: this.p.random(this.p.width),
        y: this.p.random(this.p.height),
        size: this.p.random(0.8, 1.2),
        rotation: this.p.random(this.p.TWO_PI),
        buried: this.p.random(0.3, 0.7)
      });
    }

    // Copper - less common now and requires more distance from home
    if (distanceFromHome > 2) {
      // Reduced probability for copper spawning (was 0.7, now 0.4)
      if (this.p.random() < 0.4) {
        // Reduced max count from 3 to 2
        const numCopper = this.p.int(this.p.random(1, 2));
        for (let i = 0; i < numCopper; i++) {
          this.resources[key].push({
            type: 'copper',
            x: this.p.random(this.p.width),
            y: this.p.random(this.p.height),
            size: this.p.random(1, 1.5),
            rotation: this.p.random(this.p.TWO_PI)
          });
        }
      }
    }
  }

  generateSandTexture(x: number, y: number) {
    const key = `${x},${y}`;
    let sandTexture = this.p.createGraphics(this.p.width, this.p.height);
    
    // Use pseudorandom color based on coordinates for consistency
    let sandHue = 30 + this.pseudoRandom(x * 1000 + y) * 10;
    let sandSaturation = 30 + this.pseudoRandom(x * 2000 + y) * 20;
    let sandBrightness = 80 + this.pseudoRandom(x * 3000 + y) * 10;
    
    // Base color
    sandTexture.background(sandHue, sandSaturation, sandBrightness);
    
    // Add noise pattern
    sandTexture.noStroke();
    for (let i = 0; i < this.p.width; i += 4) {
      for (let j = 0; j < this.p.height; j += 4) {
        let noise = this.p.noise((x * this.p.width + i) * 0.005, (y * this.p.height + j) * 0.005);
        let noiseHue = sandHue + (noise - 0.5) * 10;
        let noiseSat = sandSaturation + (noise - 0.5) * 15;
        let noiseBrightness = sandBrightness + (noise - 0.5) * 15;
        
        sandTexture.fill(noiseHue, noiseSat, noiseBrightness, 150);
        sandTexture.rect(i, j, 4, 4);
      }
    }
    
    this.sandTextures[key] = sandTexture;
  }

  pseudoRandom(seed: number) {
    // Simple pseudorandom function for deterministic "random" values
    return (Math.sin(seed) * 10000) % 1;
  }

  generateRockShape() {
    let numPoints = this.p.int(this.p.random(6, 10));
    let points = [];
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let r = this.p.random(5, 15);
      let x = this.p.cos(angle) * r;
      let y = this.p.sin(angle) * r;
      points.push({x, y});
    }
    return points;
  }

  generateBushShape() {
    let numPoints = this.p.int(this.p.random(8, 12));
    let points = [];
    for (let i = 0; i < numPoints; i++) {
      let angle = this.p.map(i, 0, numPoints, 0, this.p.TWO_PI);
      let r = this.p.random(3, 8);
      let x = this.p.cos(angle) * r;
      let y = this.p.sin(angle) * r;
      points.push({x, y});
    }
    return points;
  }

  generateCactusShape() {
    let cactus = [];
    
    // Main body
    let bodyHeight = this.p.random(12, 18);
    let bodyWidth = this.p.random(4, 6);
    
    let bodyPoints = [
      {x: -bodyWidth / 2, y: -bodyHeight / 2},
      {x: bodyWidth / 2, y: -bodyHeight / 2},
      {x: bodyWidth / 2, y: bodyHeight / 2},
      {x: -bodyWidth / 2, y: bodyHeight / 2}
    ];
    
    cactus.push({
      type: 'body',
      points: bodyPoints
    });
    
    // Add arms with some probability
    if (this.p.random() < 0.7) {
      let numArms = this.p.int(this.p.random(1, 3));
      for (let i = 0; i < numArms; i++) {
        let armWidth = this.p.random(3, 5);
        let armHeight = this.p.random(8, 12);
        let armY = this.p.random(-bodyHeight / 3, bodyHeight / 3);
        let armSide = this.p.random() < 0.5 ? -1 : 1;
        
        let armPoints = [
          {x: armSide * bodyWidth / 2, y: armY - armWidth / 2},
          {x: armSide * (bodyWidth / 2 + armHeight), y: armY - armWidth / 2},
          {x: armSide * (bodyWidth / 2 + armHeight), y: armY + armWidth / 2},
          {x: armSide * bodyWidth / 2, y: armY + armWidth / 2}
        ];
        
        cactus.push({
          type: 'arm',
          points: armPoints
        });
      }
    }
    
    return cactus;
  }
}
