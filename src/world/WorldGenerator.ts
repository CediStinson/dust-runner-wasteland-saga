// Modify the existing file to increase cactus frequency and decrease copper frequency
// Also add the tarp to the home base

import p5 from 'p5';

export default class WorldGenerator {
  private p: any;
  private cachedObstacles: Record<string, any[]>;
  private cachedResources: Record<string, any[]>;
  private cachedTextures: Record<string, any>;
  private windmillAngle: number;
  private clearZone: {x: number, y: number, radius: number};
  private homeArea: {x: number, y: number};
  
  constructor(p: any) {
    this.p = p;
    this.cachedObstacles = {};
    this.cachedResources = {};
    this.cachedTextures = {};
    this.windmillAngle = 0;
    this.clearZone = {x: p.width/2, y: p.height/2, radius: 150}; // Safe zone for central area
    this.homeArea = {x: 0, y: 0}; // Coordinates of home area
  }

  getObstacles(): Record<string, any[]> {
    return this.cachedObstacles;
  }
  
  getResources(): Record<string, any[]> {
    return this.cachedResources;
  }
  
  getWindmillAngle(): number {
    return this.windmillAngle;
  }
  
  updateWindmillAngle(): void {
    this.windmillAngle += 0.005;
  }
  
  clearTextures(): void {
    this.cachedTextures = {};
  }
  
  generateNewArea(x: number, y: number): void {
    const key = `${x},${y}`;
    
    if (!this.cachedObstacles[key]) {
      this.cachedObstacles[key] = [];
      
      if (x === 0 && y === 0) {
        // Special case for home area
        this.generateHomeArea();
      } else {
        // Normal area generation
        // Increase cactus count (from 3-8 to 6-12)
        const cactusCount = this.p.floor(this.p.random(6, 12));
        
        // Generate more cacti
        for (let i = 0; i < cactusCount; i++) {
          const obstacleType = 'cactus';
          const x = this.p.random(20, this.p.width - 20);
          const y = this.p.random(20, this.p.height - 20);
          const size = this.p.random(0.7, 1.2);
          
          // Generate a complex cactus shape
          const shape = this.generateCactusShape(size);
          
          this.cachedObstacles[key].push({
            type: obstacleType,
            x: x, 
            y: y,
            size: size,
            shape: shape
          });
        }
        
        // Normal rocks
        const rockCount = this.p.floor(this.p.random(5, 10));
        
        for (let i = 0; i < rockCount; i++) {
          const x = this.p.random(20, this.p.width - 20);
          const y = this.p.random(20, this.p.height - 20);
          const size = this.p.random(0.8, 1.5);
          const aspectRatio = this.p.random(0.7, 1.3);
          
          // Generate a complex rock shape
          const shape = this.generateRockShape(size, aspectRatio);
          
          this.cachedObstacles[key].push({
            type: 'rock',
            x: x, 
            y: y,
            size: size,
            aspectRatio: aspectRatio,
            shape: shape
          });
        }
        
        // Add occasional bush
        if (this.p.random() < 0.7) {
          const bushCount = this.p.floor(this.p.random(1, 4));
          
          for (let i = 0; i < bushCount; i++) {
            const x = this.p.random(20, this.p.width - 20);
            const y = this.p.random(20, this.p.height - 20);
            const size = this.p.random(0.7, 1.2);
            
            // Generate a complex bush shape
            const shape = this.generateBushShape(size);
            
            this.cachedObstacles[key].push({
              type: 'bush',
              x: x, 
              y: y,
              size: size,
              shape: shape
            });
          }
        }
      }
    }
    
    // Generate resources
    if (!this.cachedResources[key]) {
      this.cachedResources[key] = [];
      
      // Metal - basic resource
      const metalCount = this.p.floor(this.p.random(2, 5));
      
      for (let i = 0; i < metalCount; i++) {
        const x = this.p.random(20, this.p.width - 20);
        const y = this.p.random(20, this.p.height - 20);
        
        // Skip if inside the clear zone of home area
        if (x === 0 && y === 0 && this.isInClearZone(x, y)) {
          continue;
        }
        
        // Generate a metal shape
        const points = this.generateMetalShape();
        
        this.cachedResources[key].push({
          type: 'metal',
          x: x, 
          y: y,
          points: points
        });
      }
      
      // Copper - rarer resource (reduced probability from 0.7 to 0.4)
      if (this.p.random() < 0.4) {
        const copperCount = this.p.floor(this.p.random(1, 2)); // Reduced max from 3 to 2
        
        for (let i = 0; i < copperCount; i++) {
          const x = this.p.random(20, this.p.width - 20);
          const y = this.p.random(20, this.p.height - 20);
          
          // Skip if inside the clear zone of home area
          if (x === 0 && y === 0 && this.isInClearZone(x, y)) {
            continue;
          }
          
          // Generate a rock shape for copper
          const shape = this.generateRockShape(1, 1);
          
          // Generate copper vein positions
          const copperPoints = [];
          const veinCount = 3;
          for (let j = 0; j < veinCount; j++) {
            const veinPoints = [];
            const startAngle = Math.random() * this.p.TWO_PI;
            const veinLength = 3 + Math.random() * 2;
            for (let k = 0; k < veinLength; k++) {
              veinPoints.push({
                x: Math.cos(startAngle) * k * 2,
                y: Math.sin(startAngle) * k * 2
              });
            }
            copperPoints.push(veinPoints);
          }
          
          this.cachedResources[key].push({
            type: 'copper',
            x: x, 
            y: y,
            shape: shape,
            copperPoints: copperPoints
          });
        }
      }
    }
  }
  
  isInClearZone(x: number, y: number): boolean {
    const dx = x - this.clearZone.x;
    const dy = y - this.clearZone.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < this.clearZone.radius;
  }
  
  generateHomeArea(): void {
    const key = "0,0";
    
    // Add a hut near the center
    const hutX = this.p.width / 2 - 40;
    const hutY = this.p.height / 2 - 20;
    
    // Generate a complex hut shape
    const hutShape = this.generateHutShape();
    
    this.cachedObstacles[key].push({
      type: 'hut',
      x: hutX, 
      y: hutY,
      size: 1.0,
      shape: hutShape
    });
    
    // Add the tarp to the left of the hut
    const tarpX = hutX - 60;
    const tarpY = hutY;
    
    // Generate a tarp with holes
    const tarpShape = this.generateTarpShape();
    
    this.cachedObstacles[key].push({
      type: 'tarp',
      x: tarpX, 
      y: tarpY,
      size: 1.0,
      shape: tarpShape,
      color: [45, 35, 20],
      holes: this.generateTarpHoles()
    });
    
    // Add fuel pump rotated 135 degrees, closer to hut
    this.cachedObstacles[key].push({
      type: 'fuelPump',
      x: hutX + 40,
      y: hutY - 10,
      size: 1.0,
      rotation: 135 * (Math.PI / 180) // Convert 135 degrees to radians
    });
    
    // Add fuel stains
    this.cachedObstacles[key].push({
      type: 'fuelStain',
      x: hutX + 40,
      y: hutY - 10,
      seedAngle: 0.5,
      size: 1.2
    });
    
    this.cachedObstacles[key].push({
      type: 'fuelStain',
      x: hutX + 45,
      y: hutY - 5,
      seedAngle: 2.1,
      size: 0.9
    });
    
    // Add walking marks
    const walkingMarkPositions = [
      { x: this.p.width / 2 - 80, y: this.p.height / 2 + 60, angle: 0.8, size: 0.9, opacity: 170 },
      { x: this.p.width / 2 + 45, y: this.p.height / 2 + 75, angle: 5.5, size: 0.8, opacity: 150 },
      { x: this.p.width / 2 - 30, y: this.p.height / 2 - 65, angle: 2.2, size: 1.0, opacity: 190 },
      { x: this.p.width / 2 + 80, y: this.p.height / 2 - 15, angle: 3.7, size: 0.7, opacity: 160 },
      { x: this.p.width / 2 - 60, y: this.p.height / 2 - 25, angle: 1.3, size: 0.85, opacity: 180 }
    ];
      
    for (const position of walkingMarkPositions) {
      this.cachedObstacles[key].push({
        type: 'walkingMarks',
        ...position
      });
    }
    
    // Add some rocks for decoration
    for (let i = 0; i < 3; i++) {
      // Generate positions away from the center clear zone
      let rockX, rockY;
      do {
        rockX = this.p.random(20, this.p.width - 20);
        rockY = this.p.random(20, this.p.height - 20);
      } while (this.isInClearZone(rockX, rockY));
      
      const size = this.p.random(0.8, 1.2);
      const aspectRatio = this.p.random(0.7, 1.3);
      
      // Generate a complex rock shape
      const shape = this.generateRockShape(size, aspectRatio);
      
      this.cachedObstacles[key].push({
        type: 'rock',
        x: rockX, 
        y: rockY,
        size: size,
        aspectRatio: aspectRatio,
        shape: shape
      });
    }
    
    // Add some cacti away from center
    for (let i = 0; i < 4; i++) {
      // Generate positions away from the center clear zone
      let cactusX, cactusY;
      do {
        cactusX = this.p.random(20, this.p.width - 20);
        cactusY = this.p.random(20, this.p.height - 20);
      } while (this.isInClearZone(cactusX, cactusY));
      
      const size = this.p.random(0.7, 1.2);
      
      // Generate a complex cactus shape
      const shape = this.generateCactusShape(size);
      
      this.cachedObstacles[key].push({
        type: 'cactus',
        x: cactusX, 
        y: cactusY,
        size: size,
        shape: shape
      });
    }
  }
  
  generateTarpShape(): any[] {
    // Create an irregular tarp shape
    const points = [];
    const corners = 4; // Rectangular base with 4 corners
    const baseWidth = 80;
    const baseHeight = 60;

    for (let i = 0; i < corners; i++) {
      let x, y;
      
      switch (i) {
        case 0: // Top-left
          x = -baseWidth/2 + this.p.random(-5, 5);
          y = -baseHeight/2 + this.p.random(-5, 5);
          break;
        case 1: // Top-right
          x = baseWidth/2 + this.p.random(-5, 5);
          y = -baseHeight/2 + this.p.random(-5, 5);
          break;
        case 2: // Bottom-right
          x = baseWidth/2 + this.p.random(-5, 5);
          y = baseHeight/2 + this.p.random(-5, 5);
          break;
        case 3: // Bottom-left
          x = -baseWidth/2 + this.p.random(-5, 5);
          y = baseHeight/2 + this.p.random(-5, 5);
          break;
      }
      
      points.push({x, y});
    }
    
    return points;
  }
  
  generateTarpHoles(): any[] {
    // Create several holes in the tarp
    const holes = [];
    const holeCount = this.p.floor(this.p.random(3, 6));
    
    for (let i = 0; i < holeCount; i++) {
      const x = this.p.random(-35, 35);
      const y = this.p.random(-25, 25);
      const radius = this.p.random(2, 8);
      
      holes.push({
        x: x,
        y: y,
        radius: radius
      });
    }
    
    return holes;
  }
  
  generateRockShape(size: number, aspectRatio: number): any[] {
    const points = [];
    const numPoints = 8;
    const baseRadius = 10 * size;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * this.p.TWO_PI;
      const jitter = this.p.random(0.7, 1.3);
      const x = this.p.cos(angle) * baseRadius * aspectRatio * jitter;
      const y = this.p.sin(angle) * baseRadius * jitter;
      points.push({x, y});
    }
    
    return points;
  }

  generateBushShape(size: number): any[] {
    const points = [];
    const numPoints = 12;
    const baseRadius = 8 * size;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * this.p.TWO_PI;
      const jitter = this.p.random(0.6, 1.4);
      const x = this.p.cos(angle) * baseRadius * jitter;
      const y = this.p.sin(angle) * baseRadius * jitter;
      points.push({x, y});
    }
    
    return points;
  }
  
  generateCactusShape(size: number): any[] {
    // Create a main body part
    const body = {
      type: 'body',
      points: [
        {x: -3 * size, y: 0},
        {x: 3 * size, y: 0},
        {x: 3 * size, y: -25 * size},
        {x: -3 * size, y: -25 * size}
      ]
    };
    
    // Add random arm parts
    const arms = [];
    const numArms = this.p.floor(this.p.random(1, 3));
    
    for (let i = 0; i < numArms; i++) {
      const isLeftArm = this.p.random() > 0.5;
      const yPos = this.p.random(-22, -10) * size;
      
      let armPoints;
      if (isLeftArm) {
        armPoints = [
          {x: -3 * size, y: yPos},
          {x: -3 * size, y: yPos - 6 * size},
          {x: -12 * size, y: yPos - 6 * size},
          {x: -12 * size, y: yPos}
        ];
      } else {
        armPoints = [
          {x: 3 * size, y: yPos},
          {x: 3 * size, y: yPos - 6 * size},
          {x: 12 * size, y: yPos - 6 * size},
          {x: 12 * size, y: yPos}
        ];
      }
      
      arms.push({
        type: 'arm',
        points: armPoints
      });
    }
    
    return [body, ...arms];
  }

  generateHutShape(): any[] {
    // Base hut shape
    const points = [
      {x: -15, y: -10},
      {x: 15, y: -10},
      {x: 15, y: 10},
      {x: -15, y: 10}
    ];
    
    return points;
  }
  
  generateMetalShape(): any[] {
    // Complex metal scrap shape
    const points = [];
    const numPoints = 6;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * this.p.TWO_PI;
      const jitter = this.p.random(0.5, 1.5);
      const radius = this.p.random(5, 10);
      const x = this.p.cos(angle) * radius * jitter;
      const y = this.p.sin(angle) * radius * jitter;
      points.push({x, y});
    }
    
    return points;
  }
}
