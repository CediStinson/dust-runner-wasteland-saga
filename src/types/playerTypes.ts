
import { PlayerType as BasePlayerType } from '../utils/gameUtils';

export interface ExtendedPlayerType extends BasePlayerType {
  worldX: number;
  worldY: number;
  hoverbike: any;
  riding: boolean;
  obstacles: Record<string, any[]>;
  resources: Record<string, any[]>;
  cactusDamageTimer: number;
  setRiding: (value: boolean) => void;
  setWorldCoordinates: (x: number, y: number) => void;
  checkCactusDamage: () => void;
  checkForCollectableResources: () => void;
}
