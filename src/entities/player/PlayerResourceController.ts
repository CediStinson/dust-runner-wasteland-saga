
import p5 from 'p5';
import { PlayerInventory } from '../../types/PlayerTypes';
import { ResourceCollectionService } from './services/ResourceCollectionService';
import { DiggingService } from './services/DiggingService';

export class PlayerResourceController {
  private p: any;
  private resourceCollectionService: ResourceCollectionService;
  private diggingService: DiggingService;
  
  constructor(p: any) {
    this.p = p;
    this.resourceCollectionService = new ResourceCollectionService(p);
    this.diggingService = new DiggingService();
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
    return this.resourceCollectionService.collectResource(
      x, y, worldX, worldY, resources, inventory, 
      digging, canDig, player, hoverbike, startDigging, game
    );
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
    return this.diggingService.updateDigging(
      digging, digTimer, digTarget, x, y, worldX, worldY,
      resources, inventory, player, hoverbike, p
    );
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
    this.resourceCollectionService.displayCollectableResources(
      p, x, y, worldX, worldY, resources, obstacles,
      carryingFuelCanister, canisterCollectCooldown, hoverbike, canDig
    );
  }
  
  displayDigProgress(p: any, digTimer: number, digTarget: any): void {
    this.diggingService.displayDigProgress(p, digTimer, digTarget);
  }
}
