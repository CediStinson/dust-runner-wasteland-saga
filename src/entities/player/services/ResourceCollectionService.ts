
import p5 from 'p5';
import { PlayerInventory } from '../../../types/PlayerTypes';
import { emitGameStateUpdate } from '../../../utils/gameUtils';
import { interactWithWreck, collectWreckFuelCanister } from '../../../game/world/WorldInteraction';

export class ResourceCollectionService {
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
    
    // Check for wrecks first
    if (game && game.worldGenerator) {
      const currentObstacles = game.worldGenerator.getObstacles()[`${worldX},${worldY}`] || [];
      let closestWreck = null;
      let minWreckDistance = Infinity;
      
      for (const obstacle of currentObstacles) {
        if (['carWreck', 'shipWreck', 'planeWreck'].includes(obstacle.type)) {
          const distance = this.p.dist(x, y, obstacle.x, obstacle.y);
          if (distance < 50 && distance < minWreckDistance) {
            closestWreck = obstacle;
            minWreckDistance = distance;
          }
        }
      }
      
      if (closestWreck) {
        if (!player.carryingFuelCanister && closestWreck.looted && !closestWreck.canisterCollected) {
          // Player is collecting the fuel canister from the wreck
          if (collectWreckFuelCanister(closestWreck)) {
            player.carryingFuelCanister = true;
            if (game.showMessage) {
              game.showMessage("You found a fuel canister in the wreck!", 3000);
            }
            emitGameStateUpdate(player, hoverbike);
            return { inventory: newInventory, collectionMade: true };
          }
        } else if (!closestWreck.looted) {
          // Player is looting the wreck for the first time
          const lootResult = interactWithWreck(
            this.p,
            player,
            worldX,
            worldY,
            closestWreck,
            game.questSystem
          );
          
          newInventory.metal += lootResult.metalCollected;
          newInventory.copper += lootResult.copperCollected;
          
          if (game.showMessage) {
            game.showMessage(`You found ${lootResult.metalCollected} metal and ${lootResult.copperCollected} copper in the wreck!`, 3000);
          }
          
          emitGameStateUpdate(player, hoverbike);
          return { inventory: newInventory, collectionMade: true };
        }
      }
    }
    
    // Original resource collection logic
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
    // Check for wrecks first
    let closestWreck = null;
    let minWreckDistance = Infinity;
    
    let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
    for (const obs of currentObstacles) {
      if (['carWreck', 'shipWreck', 'planeWreck'].includes(obs.type)) {
        const distance = p.dist(x, y, obs.x, obs.y);
        if (distance < 50 && distance < minWreckDistance) {
          closestWreck = obs;
          minWreckDistance = distance;
        }
      }
    }
    
    if (closestWreck) {
      p.push();
      p.fill(255, 255, 100, 150);
      p.ellipse(closestWreck.x, closestWreck.y - 25, 5, 5);
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("E", closestWreck.x, closestWreck.y - 23);
      
      if (closestWreck.looted) {
        if (!closestWreck.canisterCollected && !carryingFuelCanister) {
          p.textSize(6);
          p.text("Collect Fuel", closestWreck.x, closestWreck.y - 15);
        }
      } else {
        p.textSize(6);
        p.text("Loot Wreck", closestWreck.x, closestWreck.y - 15);
      }
      p.pop();
    }
    
    // Original collectables display logic
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
