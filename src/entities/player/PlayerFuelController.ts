
import p5 from 'p5';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export class PlayerFuelController {
  private p: any;
  
  constructor(p: any) {
    this.p = p;
  }

  handleFuelCanister(
    x: number,
    y: number,
    angle: number,
    worldX: number,
    worldY: number,
    obstacles: Record<string, any[]>,
    resources: Record<string, any[]>,
    carryingFuelCanister: boolean,
    canisterCollectCooldown: number,
    hoverbike: any,
    player: any
  ): {
    carryingFuelCanister: boolean;
    canisterCollectCooldown: number;
    isCollectingCanister: boolean;
    canisterCollectionProgress: number;
    canisterCollectionTarget: any | null;
    isRefuelingHoverbike: boolean;
    refuelingProgress: number;
  } {
    if (canisterCollectCooldown > 0) {
      return {
        carryingFuelCanister,
        canisterCollectCooldown,
        isCollectingCanister: false,
        canisterCollectionProgress: 0,
        canisterCollectionTarget: null,
        isRefuelingHoverbike: false,
        refuelingProgress: 0
      };
    }
    
    if (!carryingFuelCanister) {
      let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
      
      // Check for fuel pump first
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && this.p.dist(x, y, obs.x, obs.y) < 60) {
          return {
            carryingFuelCanister,
            canisterCollectCooldown,
            isCollectingCanister: true,
            canisterCollectionProgress: 0,
            canisterCollectionTarget: obs,
            isRefuelingHoverbike: false,
            refuelingProgress: 0
          };
        }
      }
      
      // Then check for existing fuel canisters in the world
      let closestCanister = null;
      let minDistance = Infinity;
      let canisterContainer = null;
      let canisterIndex = -1;
      
      // Check obstacles for fuel canisters
      for (let i = 0; i < currentObstacles.length; i++) {
        let obs = currentObstacles[i];
        if (obs.type === 'fuelCanister' && !obs.collected) {
          const distance = this.p.dist(x, y, obs.x, obs.y);
          if (distance < 30 && distance < minDistance) {
            closestCanister = obs;
            minDistance = distance;
            canisterContainer = currentObstacles;
            canisterIndex = i;
          }
        }
      }
      
      // Check resources for fuel canisters too
      let currentResources = resources[`${worldX},${worldY}`] || [];
      for (let i = 0; i < currentResources.length; i++) {
        let res = currentResources[i];
        if (res.type === 'fuelCanister' && !res.collected) {
          const distance = this.p.dist(x, y, res.x, res.y);
          if (distance < 30 && distance < minDistance) {
            closestCanister = res;
            minDistance = distance;
            canisterContainer = currentResources;
            canisterIndex = i;
          }
        }
      }
      
      if (closestCanister && canisterContainer && canisterIndex >= 0) {
        closestCanister.collected = true;
        
        // Remove the canister from its container
        canisterContainer.splice(canisterIndex, 1);
        
        emitGameStateUpdate(player, hoverbike);
        return {
          carryingFuelCanister: true,
          canisterCollectCooldown: 30,
          isCollectingCanister: false,
          canisterCollectionProgress: 0,
          canisterCollectionTarget: null,
          isRefuelingHoverbike: false,
          refuelingProgress: 0
        };
      }
    } else {
      let currentObstacles = obstacles[`${worldX},${worldY}`] || [];
      let nearFuelPump = false;
      
      for (let obs of currentObstacles) {
        if (obs.type === 'fuelPump' && this.p.dist(x, y, obs.x, obs.y) < 60) {
          nearFuelPump = true;
          emitGameStateUpdate(player, hoverbike);
          return {
            carryingFuelCanister: false,
            canisterCollectCooldown: 30,
            isCollectingCanister: false,
            canisterCollectionProgress: 0,
            canisterCollectionTarget: null,
            isRefuelingHoverbike: false,
            refuelingProgress: 0
          };
        }
      }
      
      if (hoverbike.worldX === worldX && 
          hoverbike.worldY === worldY &&
          this.p.dist(x, y, hoverbike.x, hoverbike.y) < 30 &&
          hoverbike.fuel < hoverbike.maxFuel) {
        
        return {
          carryingFuelCanister,
          canisterCollectCooldown,
          isCollectingCanister: false,
          canisterCollectionProgress: 0,
          canisterCollectionTarget: null,
          isRefuelingHoverbike: true,
          refuelingProgress: 0
        };
      }
      
      if (!nearFuelPump) {
        let dropDistance = 20;
        let dropX = x + Math.cos(angle) * dropDistance;
        let dropY = y + Math.sin(angle) * dropDistance;
        
        // Create a properly structured canister when dropping
        currentObstacles.push({
          type: 'fuelCanister',
          x: dropX,
          y: dropY,
          collected: false,
          size: 1.0,
          hitboxWidth: 15,
          hitboxHeight: 20
        });
        
        emitGameStateUpdate(player, hoverbike);
        return {
          carryingFuelCanister: false,
          canisterCollectCooldown: 30,
          isCollectingCanister: false,
          canisterCollectionProgress: 0,
          canisterCollectionTarget: null,
          isRefuelingHoverbike: false,
          refuelingProgress: 0
        };
      }
    }
    
    return {
      carryingFuelCanister,
      canisterCollectCooldown,
      isCollectingCanister: false,
      canisterCollectionProgress: 0,
      canisterCollectionTarget: null,
      isRefuelingHoverbike: false,
      refuelingProgress: 0
    };
  }

  startCanisterCollection(
    p: any,
    x: number,
    y: number,
    velX: number,
    velY: number,
    fuelPump: any
  ): void {
    let canisterCollectionProgress = 0;
    
    const collectInterval = setInterval(() => {
      if (!this || p.dist(x, y, fuelPump.x, fuelPump.y) > 60 || 
          Math.abs(velX) > 0.3 || Math.abs(velY) > 0.3) {
        clearInterval(collectInterval);
        return;
      }
      
      canisterCollectionProgress += 0.0125;
      
      if (canisterCollectionProgress >= 1) {
        clearInterval(collectInterval);
      }
    }, 40);
  }
  
  startHoverbikeRefueling(
    p: any,
    x: number,
    y: number,
    hoverbike: any,
    player: any
  ): void {
    let refuelingProgress = 0;
    
    const refuelInterval = setInterval(() => {
      if (p.dist(x, y, hoverbike.x, hoverbike.y) > 30) {
        clearInterval(refuelInterval);
        return;
      }
      
      refuelingProgress += 0.0125;
      
      if (refuelingProgress >= 1) {
        const fuelAmount = hoverbike.maxFuel / 2;
        hoverbike.fuel = Math.min(hoverbike.fuel + fuelAmount, hoverbike.maxFuel);
        emitGameStateUpdate(player, hoverbike);
        clearInterval(refuelInterval);
      }
    }, 40);
  }
  
  startHoverbikeRepair(
    p: any,
    x: number,
    y: number,
    hoverbike: any,
    player: any,
    inventory: { metal: number; copper: number }
  ): void {
    if (inventory.metal < 1 || hoverbike.health >= hoverbike.maxHealth) {
      return;
    }
    
    let repairProgress = 0;
    
    const repairInterval = setInterval(() => {
      if (p.dist(x, y, hoverbike.x, hoverbike.y) > 30) {
        clearInterval(repairInterval);
        return;
      }
      
      repairProgress += 0.015;
      
      if (repairProgress >= 1) {
        inventory.metal--;
        hoverbike.health = p.min(hoverbike.health + 20, hoverbike.maxHealth);
        emitGameStateUpdate(player, hoverbike);
        clearInterval(repairInterval);
      }
    }, 40);
  }
  
  displayFuelProgressBars(
    p: any,
    isCollectingCanister: boolean,
    canisterCollectionTarget: any,
    canisterCollectionProgress: number,
    isRefuelingHoverbike: boolean,
    hoverbike: any,
    refuelingProgress: number,
    isRepairingHoverbike: boolean,
    repairProgress: number
  ): void {
    if (isCollectingCanister && canisterCollectionTarget) {
      p.push();
      p.translate(canisterCollectionTarget.x, canisterCollectionTarget.y - 40);
      
      p.fill(0, 0, 0, 150);
      p.rect(-15, 0, 30, 4, 2);
      
      p.fill(220, 50, 50);
      p.rect(-15, 0, 30 * canisterCollectionProgress, 4, 2);
      
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("Getting Fuel", 0, -5);
      
      p.pop();
    }
    
    if (isRefuelingHoverbike) {
      p.push();
      p.translate(hoverbike.x, hoverbike.y - 25);
      
      p.fill(0, 0, 0, 150);
      p.rect(-15, 0, 30, 4, 2);
      
      p.fill(220, 50, 50);
      p.rect(-15, 0, 30 * refuelingProgress, 4, 2);
      
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("Refueling", 0, -5);
      
      p.pop();
    }
    
    if (isRepairingHoverbike) {
      p.push();
      p.translate(hoverbike.x, hoverbike.y - 25);
      
      p.fill(0, 0, 0, 150);
      p.rect(-15, 0, 30, 4, 2);
      
      p.fill(60, 180, 60);
      p.rect(-15, 0, 30 * repairProgress, 4, 2);
      
      p.fill(255);
      p.textAlign(p.CENTER);
      p.textSize(8);
      p.text("Repairing", 0, -5);
      
      if (p.frameCount % 3 === 0 && p.random() > 0.6) {
        const sparkX = hoverbike.x + p.random(-10, 10);
        const sparkY = hoverbike.y + p.random(-5, 5);
        
        p.fill(255, 255, 200);
        p.noStroke();
        p.ellipse(sparkX - hoverbike.x, sparkY - hoverbike.y, 1.5, 1.5);
        
        p.fill(255, 255, 150, 100);
        p.ellipse(sparkX - hoverbike.x, sparkY - hoverbike.y, 3, 3);
      }
      
      p.pop();
    }
  }
}
