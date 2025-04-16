
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { QuestSystem, completeRoofRepairQuest, completeResourceQuest } from './QuestSystem';
import { updateMilitaryCrateQuest } from './MilitaryCrateQuest';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export function updateQuestSystem(
  questSystem: QuestSystem, 
  player: Player, 
  hoverbike: Hoverbike, 
  p: any, 
  worldX: number, 
  worldY: number,
  militaryCrateLocation: { worldX: number, worldY: number }
): void {
  // Update roof repair quest
  updateRoofRepairQuest(questSystem, player);
  
  // Update resource collection quest
  updateResourceQuest(questSystem, player, hoverbike);
  
  // Update military crate quest
  updateMilitaryCrateQuest(questSystem, player, hoverbike, worldX, worldY, militaryCrateLocation);
}

function updateRoofRepairQuest(questSystem: QuestSystem, player: Player): void {
  const quest = questSystem.roofRepairQuest;
  
  if (quest.active && !quest.completed) {
    quest.metalCollected = player.inventory.metal;
  }
  
  if (quest.showCompletionMessage) {
    quest.completionMessageTimer++;
    
    if (quest.completionMessageTimer > 600) {
      quest.showCompletionMessage = false;
      quest.completionMessageTimer = 0;
      
      // Activate the second quest after completing the first one
      if (quest.completed && !questSystem.resourceCollectionQuest.active) {
        questSystem.resourceCollectionQuest.active = true;
      }
    }
  }
}

function updateResourceQuest(questSystem: QuestSystem, player: Player, hoverbike: Hoverbike): void {
  const resourceQuest = questSystem.resourceCollectionQuest;
  if (resourceQuest.active && !resourceQuest.completed) {
    resourceQuest.copperCollected = player.inventory.copper;
    
    if (resourceQuest.copperCollected >= resourceQuest.requiredCopper) {
      completeResourceQuest(questSystem, player, hoverbike);
    }
  }
  
  if (resourceQuest.showCompletionMessage) {
    resourceQuest.completionMessageTimer++;
    
    if (resourceQuest.completionMessageTimer > 600) {
      resourceQuest.showCompletionMessage = false;
      resourceQuest.completionMessageTimer = 0;
    }
  }
}

export function checkHutInteraction(questSystem: QuestSystem, player: Player, p: any): boolean {
  const quest = questSystem.roofRepairQuest;
  
  if (quest.active && !quest.completed && quest.metalCollected >= quest.requiredMetal) {
    if (player.checkForHutInteraction() && p.keyIsDown(69)) { // E key
      completeRoofRepairQuest(questSystem, player, player.hoverbike);
      return true;
    }
  }
  return false;
}
