
import { QuestSystem } from '../quests/QuestSystem';

export function renderQuestUI(p: any, questSystem: QuestSystem): void {
  const roofQuest = questSystem.roofRepairQuest;
  const resourceQuest = questSystem.resourceCollectionQuest;
  
  if (roofQuest.active && !roofQuest.completed) {
    renderActiveQuest(
      p,
      "Quest: The last Sandstorm really damaged your roof.",
      `Collect Metal: ${roofQuest.metalCollected}/${roofQuest.requiredMetal}`,
      roofQuest.metalCollected >= roofQuest.requiredMetal ? 
        "Press E near your hut to repair it!" : ""
    );
  } else if (resourceQuest.active && !resourceQuest.completed) {
    renderActiveQuest(
      p,
      "Quest: You need to upgrade your hoverbike.",
      `Collect Copper: ${resourceQuest.copperCollected}/${resourceQuest.requiredCopper}`,
      ""
    );
  }
  
  if (roofQuest.showCompletionMessage) {
    renderQuestCompletion(
      p,
      "On top of the roof you just repaired you found your",
      "grandpa's old pickaxe. You are now able to dig for",
      "rare metals. Awesome!"
    );
  } else if (resourceQuest.showCompletionMessage) {
    renderQuestCompletion(
      p,
      "With the copper collected, you've successfully upgraded",
      "your hoverbike's fuel tank! It can now hold 25% more fuel,",
      "allowing for much longer exploration journeys."
    );
  }
}

export function renderActiveQuest(p: any, title: string, progress: string, hint: string): void {
  const boxWidth = 380;
  const boxHeight = 60;
  const boxX = (p.width - boxWidth) / 2;
  const boxY = p.height - 100; // Lower position to avoid overlapping with UI elements

  p.push();
  p.fill(0, 0, 0, 150);
  p.stroke(255, 255, 200, 80);
  p.strokeWeight(1);
  p.rect(boxX, boxY, boxWidth, boxHeight, 5);

  p.noStroke();
  p.fill(255, 255, 200);
  p.textSize(14);
  p.textAlign(p.LEFT);
  p.text(title, boxX + 10, boxY + 20);
  p.text(progress, boxX + 10, boxY + 42);

  // Show hint if requirements are met
  if (hint) {
    p.fill(150, 255, 150);
    p.textAlign(p.RIGHT);
    p.text(hint, boxX + boxWidth - 10, boxY + 42);
  }
  p.pop();
}

export function renderQuestCompletion(p: any, line1: string, line2: string, line3: string): void {
  p.push();
  p.fill(0, 0, 0, 150);
  p.stroke(200, 200, 100, 50);
  p.strokeWeight(2);
  p.rect(p.width / 2 - 250, p.height / 2 - 50, 500, 100, 10);

  p.noStroke();
  p.fill(255, 255, 150);
  p.textSize(16);
  p.textAlign(p.CENTER);
  p.text(line1, p.width / 2, p.height / 2 - 20);
  p.text(line2, p.width / 2, p.height / 2);
  p.text(line3, p.width / 2, p.height / 2 + 20);
  p.pop();
}
