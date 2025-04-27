import p5 from 'p5';

export default class GameRenderer {
  p: any;
  worldGenerator: any;
  player: any;
  hoverbike: any;
  worldX: number;
  worldY: number;
  timeOfDay: number;
  screenShake: {
    intensity: number;
    duration: number;
    current: number;
  };

  constructor(p: any, worldGenerator: any, player: any, hoverbike: any, worldX: number, worldY: number, initialTimeOfDay: number) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX;
    this.worldY = worldY;
    this.timeOfDay = initialTimeOfDay;
    this.screenShake = {
      intensity: 0,
      duration: 0,
      current: 0
    };
  }

  render() {
    this.p.background(50, 50, 70);
    
    // Apply screen shake if active
    if (this.screenShake.current > 0) {
      const shakeX = this.p.random(-this.screenShake.intensity, this.screenShake.intensity);
      const shakeY = this.p.random(-this.screenShake.intensity, this.screenShake.intensity);
      this.p.translate(shakeX, shakeY);
      this.screenShake.current--;
    }
    
    const areaKey = `${this.worldX},${this.worldY}`;
    
    // Render sand texture
    if (this.worldGenerator.getSandTexture(areaKey)) {
      this.p.image(this.worldGenerator.getSandTexture(areaKey), 0, 0);
    }
    
    // Render grass texture
    if (this.worldGenerator.getGrassTexture(areaKey)) {
      this.p.image(this.worldGenerator.getGrassTexture(areaKey), 0, 0);
    }
    
    // Render hoverbike if in this area
    if (this.hoverbike.worldX === this.worldX && this.hoverbike.worldY === this.worldY) {
      this.hoverbike.render();
    }
    
    // Render player
    this.player.render();
    
    // Render obstacles (rocks, bushes, cacti, etc.)
    this.renderObstacles();
    
    // Render resources (metal, copper, etc.)
    this.renderResources();
  }

  renderObstacles() {
    const obstacles = this.worldGenerator.getObstacles()[`${this.worldX},${this.worldY}`] || [];
    
    for (const obstacle of obstacles) {
      switch (obstacle.type) {
        case 'rock':
          this.renderRock(obstacle);
          break;
          
        case 'smallRock':
          this.renderSmallRock(obstacle);
          break;
          
        case 'bush':
          this.renderBush(obstacle);
          break;
          
        case 'cactus':
          this.renderCactus(obstacle);
          break;
          
        case 'metalNode':
          this.renderMetalNode(obstacle);
          break;
          
        case 'copperNode':
          this.renderCopperNode(obstacle);
          break;
          
        case 'fuelPump':
          this.renderFuelPump(obstacle);
          break;
          
        case 'windmill':
          this.renderWindmill(obstacle);
          break;
          
        case 'house':
          this.renderHouse(obstacle);
          break;
          
        case 'hut':
          this.renderHut(obstacle);
          break;
          
        case 'tarp':
          this.renderTarp(obstacle);
          break;
          
        case 'fuelCanister':
          this.renderFuelCanister(obstacle);
          break;
          
        case 'militaryCrate':
          this.renderMilitaryCrate(obstacle);
          break;
          
        case 'explosion':
          this.renderExplosion(obstacle);
          break;
          
        case 'smoke':
          this.renderSmoke(obstacle);
          break;
          
        case 'flash':
          this.renderFlash(obstacle);
          break;
          
        case 'debris':
          this.renderDebris(obstacle);
          break;
        
        case 'carWreck':
          this.renderCarWreck(obstacle);
          break;
        
        case 'shipWreck':
          this.renderShipWreck(obstacle);
          break;
          
        case 'planeWreck':
          this.renderPlaneWreck(obstacle);
          break;
      }
    }
  }
  
  renderCarWreck(wreck: any) {
    const { x, y, rotation, size, buriedDepth, looted } = wreck;
    
    this.p.push();
    this.p.translate(x, y);
    this.p.rotate(rotation);
    this.p.scale(size);
    
    // Draw buried part (darker, in the sand)
    this.p.noStroke();
    this.p.fill(150, 120, 100, 100); // Sand color
    this.p.ellipse(0, 0, 80, 50);
    
    // Draw car body
    const visibleHeight = 1.0 - buriedDepth;
    this.p.fill(80, 70, 60); // Rusty color
    this.p.rect(-35, -15 * visibleHeight, 70, 30 * visibleHeight, 5);
    
    // Windows or empty window frames
    this.p.fill(40);
    this.p.rect(-25, -15 * visibleHeight, 15, 15 * visibleHeight, 2);
    this.p.rect(10, -15 * visibleHeight, 15, 15 * visibleHeight, 2);
    
    // Draw tires (if visible)
    if (visibleHeight > 0.3) {
      this.p.fill(30);
      this.p.ellipse(-20, 15, 15, 15);
      this.p.ellipse(20, 15, 15, 15);
    }
    
    // Add some rust details
    this.p.fill(100, 60, 20, 150);
    this.p.noStroke();
    this.p.ellipse(-10, 0, 10, 8);
    this.p.ellipse(15, -5, 12, 7);
    
    // Visual indicator if looted
    if (looted) {
      this.p.fill(80);
      this.p.rect(-20, 0, 40, 5);
    }
    
    this.p.pop();
  }
  
  renderShipWreck(wreck: any) {
    const { x, y, rotation, size, buriedDepth, looted } = wreck;
    
    this.p.push();
    this.p.translate(x, y);
    this.p.rotate(rotation);
    this.p.scale(size);
    
    // Draw buried part (darker, in the sand)
    this.p.noStroke();
    this.p.fill(150, 120, 100, 100); // Sand color
    this.p.ellipse(0, 0, 100, 60);
    
    // Draw ship hull
    const visibleHeight = 1.0 - buriedDepth;
    this.p.fill(70, 80, 90); // Ship metal color
    
    // Main hull
    this.p.beginShape();
    this.p.vertex(-40, 10);
    this.p.vertex(-30, -10 * visibleHeight);
    this.p.vertex(30, -10 * visibleHeight);
    this.p.vertex(40, 10);
    this.p.endShape(this.p.CLOSE);
    
    // Ship cabin/bridge
    if (visibleHeight > 0.4) {
      this.p.fill(80, 90, 100);
      this.p.rect(-15, -15 * visibleHeight, 30, 15 * visibleHeight, 2);
    }
    
    // Add some rust details
    this.p.fill(160, 80, 40, 150);
    this.p.noStroke();
    this.p.ellipse(-25, 0, 15, 8);
    this.p.ellipse(20, -5, 12, 10);
    
    // Visual indicator if looted
    if (looted) {
      this.p.fill(60);
      this.p.rect(-20, 5, 40, 5);
    }
    
    this.p.pop();
  }
  
  renderPlaneWreck(wreck: any) {
    const { x, y, rotation, size, buriedDepth, looted } = wreck;
    
    this.p.push();
    this.p.translate(x, y);
    this.p.rotate(rotation);
    this.p.scale(size);
    
    // Draw buried part (darker, in the sand)
    this.p.noStroke();
    this.p.fill(150, 120, 100, 100); // Sand color
    this.p.ellipse(0, 0, 90, 70);
    
    // Draw plane fuselage
    const visibleHeight = 1.0 - buriedDepth;
    this.p.fill(180, 180, 170); // Plane metal color
    
    // Main fuselage
    this.p.ellipse(0, 0, 60, 20 * visibleHeight);
    
    // Wings (if visible)
    if (visibleHeight > 0.3) {
      this.p.rect(-40, -2, 80, 4);
    }
    
    // Tail section (if visible) 
    if (visibleHeight > 0.5) {
      this.p.quad(
        -30, 0,
        -35, -20 * visibleHeight,
        -25, -20 * visibleHeight,
        -20, 0
      );
    }
    
    // Add some damage details
    this.p.fill(100, 100, 90, 150);
    this.p.noStroke();
    this.p.ellipse(-15, 0, 12, 8);
    this.p.ellipse(20, -5, 15, 10);
    
    // Visual indicator if looted
    if (looted) {
      this.p.fill(90);
      this.p.rect(-20, 5, 40, 5);
    }
    
    this.p.pop();
  }

  renderResources() {
    const resources = this.worldGenerator.getResources()[`${this.worldX},${this.worldY}`] || [];
    
    for (const resource of resources) {
      switch (resource.type) {
        case 'metal':
          this.renderMetal(resource);
          break;
          
        case 'copper':
          this.renderCopper(resource);
          break;
          
        case 'fuelCanister':
          this.renderFuelCanisterResource(resource);
          break;
      }
    }
  }

  renderRock(rock: any) {
    this.p.push();
    this.p.translate(rock.x, rock.y);
    this.p.fill(100);
    this.p.beginShape();
    for (let point of rock.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  renderSmallRock(rock: any) {
    this.p.push();
    this.p.translate(rock.x, rock.y);
    this.p.fill(80);
    this.p.ellipse(0, 0, rock.hitboxWidth, rock.hitboxHeight);
    this.p.pop();
  }

  renderBush(bush: any) {
    this.p.push();
    this.p.translate(bush.x, bush.y);
    this.p.fill(50, 150, 50);
    this.p.beginShape();
    for (let point of bush.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  renderCactus(cactus: any) {
    this.p.push();
    this.p.translate(cactus.x, cactus.y);
    this.p.fill(80, 120, 60);
    for (let part of cactus.shape) {
      this.p.beginShape();
      for (let point of part.points) {
        this.p.vertex(point.x, point.y);
      }
      this.p.endShape(this.p.CLOSE);
    }
    this.p.pop();
  }

  renderMetalNode(metal: any) {
    this.p.push();
    this.p.translate(metal.x, metal.y);
    this.p.rotate(metal.rotation);
    this.p.fill(150);
    this.p.ellipse(0, 0, 15 * metal.size, 10 * metal.size);
    this.p.fill(80);
    this.p.ellipse(0, 3 * metal.size, 8 * metal.size, 6 * metal.size);
    this.p.pop();
  }

  renderCopperNode(copper: any) {
    this.p.push();
    this.p.translate(copper.x, copper.y);
    this.p.fill(200, 100, 50);
    this.p.beginShape();
    for (let point of copper.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  renderFuelPump(fuelPump: any) {
    this.p.push();
    this.p.translate(fuelPump.x, fuelPump.y);
    this.p.fill(200);
    this.p.rect(-10, -30, 20, 30);
    this.p.fill(50);
    this.p.rect(-8, -28, 16, 10);
    this.p.fill(255, 0, 0);
    this.p.ellipse(0, -15, 10, 10);
    this.p.pop();
  }

  renderWindmill(windmill: any) {
    this.p.push();
    this.p.translate(windmill.x, windmill.y);
    this.p.fill(150);
    this.p.rect(-5, -50, 10, 50);
    this.p.rotate(this.worldGenerator.getWindmillAngle());
    this.p.fill(80);
    this.p.rect(-30, -3, 60, 6);
    this.p.rotate(this.p.HALF_PI);
    this.p.rect(-30, -3, 60, 6);
    this.p.pop();
  }

  renderHouse(house: any) {
    this.p.push();
    this.p.translate(house.x, house.y);
    this.p.fill(200);
    this.p.rect(-25, -35, 50, 35);
    this.p.fill(100);
    this.p.rect(-23, -33, 46, 10);
    this.p.pop();
  }

  renderHut(hut: any) {
    this.p.push();
    this.p.translate(hut.x, hut.y);
    this.p.fill(180, 150, 100);
    this.p.ellipse(0, -15, 60, 40);
    this.p.fill(80);
    this.p.rect(-20, -5, 40, 5);
    this.p.pop();
  }

  renderTarp(tarp: any) {
    this.p.push();
    this.p.translate(tarp.x, tarp.y);
    this.p.fill(this.p.red(tarp.color), this.p.green(tarp.color), this.p.blue(tarp.color));
    this.p.rect(-21, -18, 42, 35);
    this.p.pop();
  }

  renderFuelCanister(fuelCanister: any) {
    this.p.push();
    this.p.translate(fuelCanister.x, fuelCanister.y);
    this.p.rotate(fuelCanister.rotation);
    this.p.fill(200, 200, 50);
    this.p.rect(-8, -15, 16, 30, 5);
    this.p.fill(150, 150, 0);
    this.p.rect(-5, -12, 10, 8);
    this.p.pop();
  }

  renderMilitaryCrate(crate: any) {
    this.p.push();
    this.p.translate(crate.x, crate.y);
    this.p.fill(100);
    this.p.box(25 * crate.size);
    this.p.pop();
  }

  renderExplosion(explosion: any) {
    this.p.push();
    this.p.translate(explosion.x, explosion.y);
    this.p.noStroke();
    this.p.fill(255, 200, 0, this.p.map(explosion.frame, explosion.maxFrames - 30, explosion.maxFrames, 255, 0));
    this.p.ellipse(0, 0, 10 * explosion.size);
    this.p.pop();
    explosion.frame++;
  }

  renderSmoke(smoke: any) {
    this.p.push();
    this.p.translate(smoke.x, smoke.y);
    this.p.noStroke();
    this.p.fill(100, this.p.map(smoke.frame, smoke.maxFrames - 60, smoke.maxFrames, 150, 0));
    this.p.ellipse(0, 0, 12 * smoke.size);
    this.p.pop();
    smoke.frame++;
  }

  renderFlash(flash: any) {
    if (flash.frame < flash.maxFrames) {
      this.p.push();
      this.p.translate(flash.x, flash.y);
      this.p.noStroke();
      this.p.fill(255, 255, 200, this.p.map(flash.frame, 0, flash.maxFrames, 255, 0));
      this.p.ellipse(0, 0, 60 * flash.size);
      this.p.pop();
      flash.frame++;
    }
  }

  renderDebris(debris: any) {
    this.p.push();
    this.p.translate(debris.x, debris.y);
    this.p.rotate(debris.rotation);
    this.p.fill(debris.color.r, debris.color.g, debris.color.b);
    this.p.noStroke();
    this.p.rect(-debris.size / 2, -debris.size / 2, debris.size, debris.size);
    this.p.pop();
  }

  renderMetal(metal: any) {
    this.p.push();
    this.p.translate(metal.x, metal.y);
    this.p.rotate(metal.rotation);
    this.p.fill(150);
    this.p.ellipse(0, 0, 8 * metal.size, 6 * metal.size);
    this.p.pop();
  }

  renderCopper(copper: any) {
    this.p.push();
    this.p.translate(copper.x, copper.y);
    this.p.fill(200, 100, 50);
    this.p.beginShape();
    for (let point of copper.shape) {
      this.p.vertex(point.x, point.y);
    }
    this.p.endShape(this.p.CLOSE);
    this.p.pop();
  }

  renderFuelCanisterResource(fuelCanister: any) {
    this.p.push();
    this.p.translate(fuelCanister.x, fuelCanister.y);
    this.p.rotate(fuelCanister.rotation);
    this.p.fill(200, 200, 50);
    this.p.rect(-5, -10, 10, 20, 3);
    this.p.fill(150, 150, 0);
    this.p.rect(-3, -8, 6, 5);
    this.p.pop();
  }

  setTimeOfDay(timeOfDay: number) {
    this.timeOfDay = timeOfDay;
  }

  startScreenShake(intensity: number, duration: number) {
    this.screenShake = {
      intensity,
      duration,
      current: duration
    };
  }
}
