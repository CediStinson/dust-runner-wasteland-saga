
export interface PlayerType {
  x: number;
  y: number;
  velX: number;
  velY: number;
  speed: number;
  inventory: { [key: string]: number };
  angle: number;
  digging: boolean;
  digTimer: number;
  digTarget: any;
  health: number;
  maxHealth: number;
  update: () => void;
  handleInput: () => void;
  applyFriction: () => void;
  display: () => void;
  collectResource: () => void;
  startDigging: (target: any) => void;
  updateDigging: () => void;
  displayDigProgress: () => void;
}

export interface HoverbikeType {
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  velocityX: number;
  velocityY: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
  speed: number;
  speedLevel: number;
  durabilityLevel: number;
  collisionCooldown: number;
  update: () => void;
  handleControls: () => void;
  applyMovement: () => void;
  checkCollisions: () => void;
  display: () => void;
  upgradeSpeed: () => void;
  upgradeDurability: () => void;
}

// String hashCode extension
declare global {
  interface String {
    hashCode(): number;
  }
}

// Hash function implementation
String.prototype.hashCode = function() {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    let char = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

// Function to emit game state updates
export function emitGameStateUpdate(player: any, hoverbike: any) {
  const event = new CustomEvent('gameStateUpdate', {
    detail: {
      resources: player?.inventory?.metal || 0,
      copper: player?.inventory?.copper || 0,
      health: hoverbike?.health || 0,
      maxHealth: hoverbike?.maxHealth || 100,
      fuel: hoverbike?.fuel || 0,
      maxFuel: hoverbike?.maxFuel || 100,
      playerHealth: player?.health || 100,
      maxPlayerHealth: player?.maxHealth || 100,
      worldX: player?.worldX || 0,
      worldY: player?.worldY || 0,
      baseWorldX: 0, // Home base is at 0,0
      baseWorldY: 0
    }
  });
  window.dispatchEvent(event);
}
