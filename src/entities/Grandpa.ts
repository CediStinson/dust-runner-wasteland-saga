
import p5 from 'p5';

export default class Grandpa {
  p: any;
  x: number;
  y: number;
  worldX: number;
  worldY: number;
  angle: number;
  size: number;
  lastSpeechTime: number;
  speechInterval: number;
  currentSpeech: string | null;
  speechDuration: number;
  speechTimer: number;
  speeches: string[];
  questActive: boolean;
  
  constructor(p: any, x: number, y: number, worldX: number, worldY: number) {
    this.p = p;
    this.x = x;
    this.y = y;
    this.worldX = worldX;
    this.worldY = worldY;
    this.angle = Math.PI; // Facing down/south
    this.size = 1.0;
    this.lastSpeechTime = 0;
    this.speechInterval = p.random(8000, 15000); // Random interval between speeches
    this.currentSpeech = null;
    this.speechDuration = 4000; // How long speech bubbles stay visible
    this.speechTimer = 0;
    this.questActive = true;
    
    // Collection of funny/quirky grandpa lines
    this.speeches = [
      "Back in my day, we didn't have hovercrafts. We had LEGS!",
      "This desert ain't nothing compared to the one I crossed barefoot!",
      "Have I told you about the time I wrestled a sand shark?",
      "Don't forget to check your oil... and your underwear!",
      "If you find any good scrap metal, bring it here. I'm not getting any younger!",
      "These new fuel canisters explode if you look at 'em wrong!",
      "My secret to long life? Sand. It's coarse and rough and gets everywhere!",
      "You know what this wasteland needs? More cacti. Said no one ever.",
      "In my day, copper was so common we used it for toilet paper!",
      "Watch out for those rocks! They're harder than my head, and that's saying something!",
      "Remember: what doesn't kill you... usually tries again.",
      "The hoverbike's making that noise again? Try kicking it!",
      "You look just like your father... except he was handsome!",
      "I'd give you advice, but you never listen anyway.",
      "Sleep? Bah! I'll sleep when I'm dead... which could be soon, so hurry up with those quests!"
    ];
  }
  
  update() {
    // Only show grandpa at home base (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) {
      return;
    }
    
    // Speech logic
    const currentTime = Date.now();
    
    // Check if it's time for a new speech
    if (!this.currentSpeech && currentTime - this.lastSpeechTime > this.speechInterval) {
      this.saySomethingRandom();
      this.lastSpeechTime = currentTime;
      this.speechInterval = this.p.random(8000, 15000); // Set next interval
    }
    
    // Handle speech timer
    if (this.currentSpeech) {
      this.speechTimer += 16.67; // Approximately one frame at 60fps
      if (this.speechTimer >= this.speechDuration) {
        this.currentSpeech = null;
        this.speechTimer = 0;
      }
    }
    
    // Subtle idle animation - slight swaying
    this.angle = Math.PI + Math.sin(this.p.frameCount / 30) * 0.05;
  }
  
  render() {
    // Only render grandpa at home base (0,0)
    if (this.worldX !== 0 || this.worldY !== 0) {
      return;
    }
    
    this.p.push();
    this.p.translate(this.x, this.y);
    
    // Draw shadow
    this.p.fill(0, 0, 0, 80);
    this.p.noStroke();
    this.p.ellipse(0, 5, 20, 10);
    
    // Draw body
    this.p.rotate(this.angle);
    
    // Grandpa-specific appearance
    this.drawGrandpa();
    
    this.p.pop();
    
    // Draw speech bubble if active
    if (this.currentSpeech) {
      this.drawSpeechBubble();
    }
  }
  
  drawGrandpa() {
    const p = this.p;
    
    // Draw legs
    p.stroke(60, 50, 40);
    p.strokeWeight(4);
    p.line(-5, 0, -5, 10);
    p.line(5, 0, 5, 10);
    
    // Draw body - older, slightly hunched
    p.fill(70, 60, 80); // Purple-ish overalls
    p.stroke(50, 40, 60);
    p.strokeWeight(1);
    p.ellipse(0, -2, 16, 18);
    
    // Draw arms - slightly more hunched
    p.stroke(60, 50, 40);
    p.strokeWeight(3);
    p.line(-8, -4, -12, 5);
    p.line(8, -4, 12, 5);
    
    // Walking stick in one hand
    p.stroke(100, 70, 40);
    p.strokeWeight(2);
    p.line(12, 5, 15, 15);
    
    // Draw head with white hair
    p.fill(220, 210, 200); // Pale skin tone
    p.stroke(50, 40, 30);
    p.strokeWeight(1);
    p.ellipse(0, -12, 14, 14);
    
    // Draw white hair/beard
    p.fill(230, 230, 230);
    p.noStroke();
    
    // Hair on top - balding pattern
    p.arc(0, -16, 14, 8, Math.PI, 0, p.OPEN);
    
    // Side hair tufts
    p.ellipse(-7, -12, 4, 8);
    p.ellipse(7, -12, 4, 8);
    
    // Beard
    p.ellipse(0, -8, 12, 8);
    
    // Glasses
    p.stroke(40);
    p.strokeWeight(1);
    p.noFill();
    p.ellipse(-3, -12, 5, 5); // Left lens
    p.ellipse(3, -12, 5, 5);  // Right lens
    p.line(-1, -12, 1, -12);  // Bridge
    
    // Facial expression - small smile
    if (!this.currentSpeech) {
      // Default expression when not talking
      p.stroke(40, 30, 20);
      p.noFill();
      p.arc(0, -10, 8, 4, 0.1, Math.PI - 0.1);
    } else {
      // Talking expression
      p.stroke(40, 30, 20);
      p.fill(0);
      p.ellipse(0, -9, 6, 4);
    }
  }
  
  drawSpeechBubble() {
    const p = this.p;
    const bubbleWidth = Math.min(this.currentSpeech!.length * 7, 200);
    const bubbleHeight = 40;
    const bubbleX = this.x - bubbleWidth / 2;
    const bubbleY = this.y - 80;
    
    // Calculate fade in/out based on timer
    let alpha = 255;
    
    // Fade in for the first 500ms
    if (this.speechTimer < 500) {
      alpha = Math.floor((this.speechTimer / 500) * 255);
    } 
    // Fade out for the last 500ms
    else if (this.speechTimer > this.speechDuration - 500) {
      alpha = Math.floor(((this.speechDuration - this.speechTimer) / 500) * 255);
    }
    
    // Background of speech bubble
    p.fill(255, 255, 250, alpha);
    p.stroke(0, 0, 0, alpha * 0.7);
    p.strokeWeight(1);
    p.rect(bubbleX, bubbleY, bubbleWidth, bubbleHeight, 10);
    
    // Pointer triangle
    p.beginShape();
    p.vertex(this.x, bubbleY + bubbleHeight);
    p.vertex(this.x - 10, bubbleY + bubbleHeight - 5);
    p.vertex(this.x + 10, bubbleY + bubbleHeight - 5);
    p.endShape(p.CLOSE);
    
    // Text
    p.fill(0, 0, 0, alpha);
    p.noStroke();
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(12);
    
    // Word wrap the text if it's too long
    if (this.currentSpeech!.length > 28) {
      const words = this.currentSpeech!.split(' ');
      let line = '';
      let y = bubbleY + 15;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        if (testLine.length > 28) {
          p.text(line, this.x, y);
          line = words[i] + ' ';
          y += 15;
        } else {
          line = testLine;
        }
      }
      p.text(line, this.x, y);
    } else {
      p.text(this.currentSpeech!, this.x, bubbleY + bubbleHeight/2);
    }
  }
  
  saySomethingRandom() {
    const randomIndex = Math.floor(this.p.random(this.speeches.length));
    this.currentSpeech = this.speeches[randomIndex];
    this.speechTimer = 0;
  }
  
  speakQuestDialogue(questType: string) {
    switch (questType) {
      case 'roofRepair':
        this.currentSpeech = "The roof's got more holes than my memory! Bring me 10 metal scraps to fix it.";
        break;
      case 'resourceCollection':
        this.currentSpeech = "The hoverbike could use an upgrade. Find me 5 copper pieces!";
        break;
      default:
        this.saySomethingRandom();
    }
    this.speechTimer = 0;
    this.speechDuration = 6000; // Longer duration for quest dialogues
  }
  
  completeQuest(questType: string) {
    switch (questType) {
      case 'roofRepair':
        this.currentSpeech = "Well done! Found my old pickaxe on the roof. It's yours now!";
        break;
      case 'resourceCollection':
        this.currentSpeech = "Perfect! Your hoverbike's fuel tank is now 25% bigger. Don't crash it!";
        break;
      default:
        this.currentSpeech = "That's the spirit! Now about that other thing I needed...";
    }
    this.speechTimer = 0;
    this.speechDuration = 6000; // Longer duration for quest completion dialogues
  }
}
