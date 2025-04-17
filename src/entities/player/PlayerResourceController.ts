
import p5 from 'p5';
import { PlayerInventory } from '../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export class PlayerResourceController {
  private p: any;
  
  constructor(p: any) {
    this.p = p;
  }
  
  collectResource(
    x: number, 
    y: number, 
    worldX: number, 
    worldY: number,
    resources: Record<string, any[]>,
    inventory: PlayerInventory,
    digging: boolean,
    canDig: boolean,
    player: any,
    hoverbike: any,
    startDigging: (target: any) => void,
    game: any
  ): { inventory: PlayerInventory, collectionMade: boolean } {
    let currentResources = resources[`${worldX},${worldY}`] || [];
    let collectionMade = false;
    let newInventory = { ...inventory };
    
    let closestResource = null;
    let minDistance = Infinity;
    
    for (let i = 0; i < currentResources.length; i++) {
      let res = currentResources[i];
      const distance = this.p.dist(x, y, res.x, res.y);
      
      if (distance < 30 && distance < minDistance) {
        closestResource = res;
        minDistance = distance;
      }
    }
    
    if (closestResource) {
      if (closestResource.type === 'metal') {
        newInventory.metal++;
        const index = currentResources.indexOf(closestResource);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
        emitGameStateUpdate(player, hoverbike);
        collectionMade = true;
      } else if (closestResource.type === 'copper' && !digging && canDig) {
        startDigging(closestResource);
        collectionMade = true;
      } else if (closestResource.type === 'copper' && !canDig) {
        if (this.p.frameCount % 60 === 0) {
          console.log("First quest must be completed to mine copper");
          if (game && typeof game.showMessage === 'function') {
            game.showMessage("Complete the first quest to unlock copper mining", 3000);
          }
        }
      }
    }
    
    return { inventory: newInventory, collectionMade };
  }
  
  updateDigging(
    digging: boolean,
    digTimer: number,
    digTarget: any,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
    resources: Record<string, any[]>,
    inventory: PlayerInventory,
    player: any,
    hoverbike: any,
    p: any
  ): {
    digging: boolean,
    isDigging: boolean,
    digTimer: number,
    digTarget: any | null,
    inventory: PlayerInventory
  } {
    if (!digging) return { 
      digging, 
      isDigging: false, 
      digTimer, 
      digTarget, 
      inventory 
    };
    
    let newDigTimer = digTimer + 1;
    let newDigging = digging;
    let newIsDigging = true;
    let newDigTarget = digTarget;
    let newInventory = { ...inventory };
    
    if (newDigTimer >= 480) {
      newDigging = false;
      newIsDigging = false;
      
      let copperAmount = p.floor(p.random(1, 4));
      newInventory.copper += copperAmount;
      
      let currentResources = resources[`${worldX},${worldY}`];
      if (currentResources) {
        let index = currentResources.indexOf(digTarget);
        if (index !== -1) {
          currentResources.splice(index, 1);
        }
      }
      
      newDigTarget = null;
      emitGameStateUpdate(player, hoverbike);
    }
    
    if (p.keyIsDown(p.UP_ARROW) || p.keyIsDown(p.DOWN_ARROW) || 
        p.keyIsDown(p.LEFT_ARROW) || p.keyIsDown(p.RIGHT_ARROW) ||
        !digTarget || p.dist(x, y, digTarget.x, digTarget.y) > 30) {
      newDigging = false;
      newIsDigging = false;
      newDigTarget = null;
    }
    
    return {
      digging: newDigging,
      isDigging: newIsDigging,
      digTimer: newDigTimer,
      digTarget: newDigTarget,
      inventory: newInventory
    };
  }
  
  displayCollectableResources(
    p: any,
    x: number,
    y: number,
    worldX: number,
    worldY: number,
    resources: Record<string, any[]>,
    obstacles: Record<string, any[]>,
    carryingFuelCanister: boolean,
    canisterCollectCooldown: number,
    hoverbike: any,
    canDig: boolean
  ): void {
    let closestResource = null;
    let minDistance = Infinity;
    let currentResources = resources[`${worldX},${worldY}`] || [];
    
    for (let res of currentResources) {
      if (res.type === 'metal' || (res.type === 'copper' && canDig)) {
        const distance = p.dist(x, y, res.x, res.y);
        if (distance < 30 && distance < minDistance) {
          closestResource = res;
          minDistance = distance;
        }
      }
    }
    
    if (closestResource) {
      p.push();
      p.fill(255, 255, 100, 150);
      p.ellipse(closestResource.x, closestResource.y - 15, 5, 5);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("E", closestResource.x, closestResource.y - 13);
      p.pop();
    }
    
    if (!carryingFuelCanister && canisterCollectCooldown === 0) {
      let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && p.dist(x, y, obs.x, obs.y) < 60) {
          p.push();
          p.fill(255, 255, 100, 150);
          p.ellipse(obs.x, obs.y - 35, 5, 5);
          p.fill(255);
          p.textAlign(p.CENTER);
          p.textSize(8);
          p.text("E", obs.x, obs.y - 33);
          p.textSize(6);
          p.text("Get Fuel", obs.x, obs.y - 25);
          p.pop();
        }
      }
    }
    
    let closestCanister = null;
    let minCanisterDistance = Infinity;
    let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    
    for (let obs of currentObstacles) {
      if (obs.type === 'fuelCanister' && !obs.collected) {
        const distance = p.dist(x, y, obs.x, obs.y);
        if (distance < 30 && distance < minCanisterDistance) {
          closestCanister = obs;
          minCanisterDistance = distance;
        }
      }
    }
    
    if (closestCanister) {
      p.push();
      p.fill(255, 255, 100, 150);
      p.ellipse(closestCanister.x, closestCanister.y - 15, 5, 5);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("E", closestCanister.x, closestCanister.y - 13);
      p.pop();
    }
    
    if (carryingFuelCanister && 
        hoverbike.worldX === worldX && 
        hoverbike.worldY === worldY &&
        p.dist(x, y, hoverbike.x, hoverbike.y) < 30 &&
        hoverbike.fuel < hoverbike.maxFuel) {
      p.push();
      p.fill(255, 255, 100, 150);
      p.ellipse(hoverbike.x, hoverbike.y - 15, 5, 5);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("E", hoverbike.x, hoverbike.y - 13);
      p.textSize(6);
      p.text("Refuel", hoverbike.x, hoverbike.y - 5);
      p.pop();
    }
  }
}
