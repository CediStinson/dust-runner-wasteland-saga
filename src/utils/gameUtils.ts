
import p5 from 'p5';

export interface PlayerType {
  x: number;
  y: number;
  velX: number;
  velY: number;
  angle: number;
  worldX: number;
  worldY: number;
  inventory: { [key: string]: number };
  health: number;
  maxHealth: number;
  riding: boolean;
  hoverbike: any;
}

export interface HoverbikeType {
  x: number;
  y: number;
  velX: number;
  velY: number;
  worldX: number;
  worldY: number;
  angle: number;
  health: number;
  maxHealth: number;
  fuel: number;
  maxFuel: number;
}

// Random tarp color generator - using muted earthy tones
export const getRandomTarpColor = (p: any) => {
  // Array of soft/muted color options for the tarp
  const tarpColors = [
    { r: 160, g: 120, b: 90 },  // Soft brown
    { r: 140, g: 90, b: 80 },   // Muted terracotta
    { r: 110, g: 130, b: 90 },  // Olive green
    { r: 130, g: 150, b: 130 }, // Sage green
    { r: 160, g: 110, b: 90 },  // Desert sand
    { r: 140, g: 100, b: 100 }, // Dusty rose
    { r: 120, g: 120, b: 130 }, // Slate gray
    { r: 150, g: 130, b: 110 }, // Khaki
  ];
  
  // Return a random color from the array
  return tarpColors[Math.floor(p.random(0, tarpColors.length))];
};

// Event emitter for game state updates
export const emitGameStateUpdate = (player: PlayerType, hoverbike: HoverbikeType) => {
  const event = new CustomEvent('gameStateUpdate', {
    detail: {
      resources: player?.inventory?.metal || 0,
      copper: player?.inventory?.copper || 0,
      health: hoverbike?.health || 0,
      maxHealth: hoverbike?.maxHealth || 100,
      fuel: hoverbike?.fuel || 0,
      maxFuel: hoverbike?.maxFuel || 100,
      playerHealth: player?.health || 100,
      maxPlayerHealth: player?.maxHealth || 100
    }
  });
  window.dispatchEvent(event);
};
