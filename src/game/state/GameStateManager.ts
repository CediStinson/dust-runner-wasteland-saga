
import { GameState } from '../../types/GameTypes';
import Game from '../Game';
import { createDefaultGameState } from './SaveLoadManager';

export function cleanupActiveActions(gameRef: Game | null): void {
  if (!gameRef) return;
  
  if (gameRef.player) {
    if (gameRef.player.digging) {
      gameRef.player.cancelDigging();
    }
    gameRef.player.isCollectingCanister = false;
    gameRef.player.isRefuelingHoverbike = false;
    gameRef.player.isRepairingHoverbike = false;
    
    if (gameRef.player.droppingCanister) {
      gameRef.player.droppingCanister = false;
    }
  }
  
  gameRef.sleepingInHut = false;
}

export function applyGameState(gameRef: Game | null, savedState: GameState): void {
  if (!gameRef || !savedState) return;
  
  cleanupActiveActions(gameRef);
  
  // Apply player inventory
  if (gameRef.player) {
    if (savedState.resources !== undefined) {
      gameRef.player.inventory.metal = savedState.resources;
    }
    
    if (savedState.copper !== undefined) {
      gameRef.player.inventory.copper = savedState.copper;
    }
    
    if (savedState.playerHealth !== undefined) {
      gameRef.player.health = savedState.playerHealth;
    }
    
    // Reset player interaction states
    gameRef.player.digging = false;
    gameRef.player.isDigging = false;
    gameRef.player.digTimer = 0;
    gameRef.player.digTarget = null;
    gameRef.player.isCollectingCanister = false;
    gameRef.player.isRefuelingHoverbike = false;
    gameRef.player.isRepairingHoverbike = false;
  }
  
  // Apply hoverbike state
  if (gameRef.hoverbike) {
    if (savedState.health !== undefined) {
      gameRef.hoverbike.health = savedState.health;
    }
    
    if (savedState.fuel !== undefined) {
      gameRef.hoverbike.fuel = savedState.fuel;
    }
  }
  
  // Apply world position
  if (savedState.worldX !== undefined && savedState.worldY !== undefined) {
    gameRef.worldX = savedState.worldX;
    gameRef.worldY = savedState.worldY;
    
    applyPlayerPosition(gameRef, savedState);
    applyHoverbikePosition(gameRef, savedState);
    
    gameRef.riding = false;
    if (gameRef.player) {
      gameRef.player.riding = false;
    }
    
    if (gameRef.renderer) {
      gameRef.renderer.setWorldCoordinates(savedState.worldX, savedState.worldY);
    }
  }
  
  // Apply game state
  if (savedState.gameStarted !== undefined) {
    gameRef.gameStarted = savedState.gameStarted;
  }
  
  // Apply world data
  if (savedState.worldData) {
    gameRef.loadWorldData(savedState.worldData);
  }
  
  // Force regenerate current area
  gameRef.worldGenerator.generateNewArea(gameRef.worldX, gameRef.worldY);
}

function applyPlayerPosition(gameRef: Game, savedState: GameState): void {
  if (!gameRef.player) return;
  
  gameRef.player.setWorldCoordinates(savedState.worldX, savedState.worldY);
  
  if (savedState.playerX !== undefined && savedState.playerY !== undefined) {
    gameRef.player.x = savedState.playerX;
    gameRef.player.y = savedState.playerY;
    
    // Ensure player stays within bounds
    gameRef.player.x = Math.max(10, Math.min(gameRef.p.width - 10, gameRef.player.x));
    gameRef.player.y = Math.max(10, Math.min(gameRef.p.height - 10, gameRef.player.y));
    
    if (savedState.playerAngle !== undefined) {
      gameRef.player.angle = savedState.playerAngle;
      gameRef.player.lastAngle = savedState.playerAngle;
    }
    
    if (savedState.carryingFuelCanister !== undefined) {
      gameRef.player.carryingFuelCanister = savedState.carryingFuelCanister;
    }
  } else {
    gameRef.player.x = gameRef.p.width / 2;
    gameRef.player.y = gameRef.p.height / 2 - 50;
  }
}

function applyHoverbikePosition(gameRef: Game, savedState: GameState): void {
  if (!gameRef.hoverbike) return;
  
  gameRef.hoverbike.isRiding = false;
  gameRef.hoverbike.thrustIntensity = 0;
  gameRef.hoverbike.flameLength = 0;
  
  if (savedState.hoverbikeWorldX !== undefined && savedState.hoverbikeWorldY !== undefined) {
    gameRef.hoverbike.setWorldCoordinates(savedState.hoverbikeWorldX, savedState.hoverbikeWorldY);
  } else {
    gameRef.hoverbike.setWorldCoordinates(savedState.worldX, savedState.worldY);
  }
  
  if (savedState.hoverbikeX !== undefined && savedState.hoverbikeY !== undefined) {
    gameRef.hoverbike.x = savedState.hoverbikeX;
    gameRef.hoverbike.y = savedState.hoverbikeY;
    
    // Ensure hoverbike stays within bounds
    gameRef.hoverbike.x = Math.max(20, Math.min(gameRef.p.width - 20, gameRef.hoverbike.x));
    gameRef.hoverbike.y = Math.max(20, Math.min(gameRef.p.height - 20, gameRef.hoverbike.y));
    
    if (savedState.hoverbikeAngle !== undefined) {
      gameRef.hoverbike.angle = savedState.hoverbikeAngle;
    }
  } else {
    if (!savedState.gameStarted) {
      gameRef.hoverbike.x = gameRef.p.width / 2 - 120;
    } else {
      gameRef.hoverbike.x = gameRef.p.width / 2;
      gameRef.hoverbike.y = gameRef.p.height / 2;
    }
  }
}
