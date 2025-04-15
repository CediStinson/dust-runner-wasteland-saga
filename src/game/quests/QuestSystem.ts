
import Player from '../../entities/Player';
import Hoverbike from '../../entities/Hoverbike';
import { emitGameStateUpdate } from '../../utils/gameUtils';

export interface RoofRepairQuest {
  active: boolean;
  completed: boolean;
  metalCollected: number;
  requiredMetal: number;
  rewardGiven: boolean;
  showCompletionMessage: boolean;
  completionMessageTimer: number;
}

export interface ResourceCollectionQuest {
  active: boolean;
  completed: boolean;
  copperCollected: number;
  requiredCopper: number;
  rewardGiven: boolean;
  showCompletionMessage: boolean;
  completionMessageTimer: number;
}

export interface MilitaryCrateQuest {
  active: boolean;
  completed: boolean;
  crateOpened: boolean;
  targetX: number;
  targetY: number;
  showCompletionMessage: boolean;
  completionMessageTimer: number;
  rewardGiven: boolean;
}

export interface QuestSystem {
  roofRepairQuest: RoofRepairQuest;
  resourceCollectionQuest: ResourceCollectionQuest;
  militaryCrateQuest: MilitaryCrateQuest;
  diaryEntries: string[];
}

export function initializeQuestSystem(): QuestSystem {
  return {
    roofRepairQuest: {
      active: true,
      completed: false,
      metalCollected: 0,
      requiredMetal: 10,
      rewardGiven: false,
      showCompletionMessage: false,
      completionMessageTimer: 0
    },
    resourceCollectionQuest: {
      active: false,
      completed: false,
      copperCollected: 0,
      requiredCopper: 5,
      rewardGiven: false,
      showCompletionMessage: false,
      completionMessageTimer: 0
    },
    militaryCrateQuest: {
      active: false,
      completed: false,
      crateOpened: false,
      targetX: 0,
      targetY: 0,
      showCompletionMessage: false,
      completionMessageTimer: 0,
      rewardGiven: false
    },
    diaryEntries: ["", "", "", "", ""]
  };
}

export function updateQuestSystem(questSystem: QuestSystem, player: Player, hoverbike: Hoverbike, p: any): void {
  // Update roof repair quest
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
  
  // Update resource collection quest
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
      return true;
    }
  }
  return false;
}

export function completeRoofRepairQuest(questSystem: QuestSystem, player: Player, hoverbike: Hoverbike): void {
  const quest = questSystem.roofRepairQuest;
  
  if (!quest.rewardGiven) {
    // Subtract metal used for repair
    player.inventory.metal -= quest.requiredMetal;
    
    // Mark quest as completed
    quest.completed = true;
    quest.active = false;
    quest.rewardGiven = true;
    quest.showCompletionMessage = true;
    quest.completionMessageTimer = 0;
    
    // Give rewards
    player.canDig = true;
    
    // Update UI
    emitGameStateUpdate(player, hoverbike);
  }
}

export function completeResourceQuest(questSystem: QuestSystem, player: Player, hoverbike: Hoverbike): void {
  const quest = questSystem.resourceCollectionQuest;
  
  if (!quest.rewardGiven && quest.copperCollected >= quest.requiredCopper) {
    // Mark quest as completed
    quest.completed = true;
    quest.active = false;
    quest.rewardGiven = true;
    quest.showCompletionMessage = true;
    quest.completionMessageTimer = 0;
    
    // Give rewards - increase hoverbike fuel capacity
    hoverbike.maxFuel += 25;
    hoverbike.fuel = Math.min(hoverbike.fuel + 25, hoverbike.maxFuel);
    
    // Update UI
    emitGameStateUpdate(player, hoverbike);
  }
}
