
export default class PlayerRenderer {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  display(player: any) {
    const { x, y, angle, riding, health, maxHealth, digging, digTimer, cactusDamageTimer } = player;
    
    this.p.push();
    this.p.translate(x, y);
    this.p.rotate(angle + this.p.PI / 2);
    
    // Flash red effect when taking cactus damage
    const damageFlash = !riding && cactusDamageTimer > 25;
    
    if (riding) {
      this.drawRidingPlayer();
    } else {
      this.drawStandingPlayer(damageFlash);
      
      // Show digging animation if active
      if (digging) {
        this.drawDiggingAnimation(damageFlash, digTimer);
      }
    }
    
    this.p.pop();
    
    // Draw player health bar above player
    if (!riding) {
      this.drawHealthBar(x, y, health, maxHealth);
    }
  }

  private drawRidingPlayer() {
    // Body
    this.p.fill(120, 100, 80);
    this.p.ellipse(0, -4, 8, 7);
    
    // Arms holding handlebars
    this.p.fill(150, 130, 110);
    this.p.ellipse(-6, -1, 4, 2);
    this.p.ellipse(6, -1, 4, 2);
    
    // Head with helmet
    this.p.fill(80, 60, 40);
    this.p.ellipse(0, -8, 7, 6);
    
    // Helmet visor
    this.p.fill(50, 50, 50);
    this.p.arc(0, -8, 6, 4, -this.p.PI * 0.8, this.p.PI * 0.8);
    
    // Legs
    this.p.fill(120, 100, 80);
    this.p.rect(-3, 0, 2, 4, 1);
    this.p.rect(3, 0, 2, 4, 1);
  }

  private drawStandingPlayer(damageFlash: boolean) {
    // Cloak with outline
    if (damageFlash) {
      this.p.fill(200, 80, 60); // Red flash when damaged
    } else {
      this.p.fill(120, 100, 80);
    }
    
    this.p.stroke(100, 80, 60); // Added outline
    this.p.strokeWeight(0.8);   // Medium outline
    this.p.beginShape();
    this.p.vertex(-8, -10);
    this.p.vertex(-6, -4);
    this.p.vertex(-10, 2);
    this.p.vertex(-4, 8);
    this.p.vertex(4, 8);
    this.p.vertex(10, 2);
    this.p.vertex(6, -4);
    this.p.vertex(8, -10);
    this.p.endShape(this.p.CLOSE);
    this.p.noStroke();
    
    // Cloak details - Fixed conditional color expressions
    const cloakColor = damageFlash ? 
      this.p.color(220, 150, 130) : 
      this.p.color(150, 130, 110);
    this.p.fill(cloakColor);
    this.p.ellipse(-4, 2, 4, 3);
    this.p.ellipse(4, 2, 4, 3);
    
    const detailColor = damageFlash ? 
      this.p.color(180, 60, 40) : 
      this.p.color(100, 80, 60);
    this.p.fill(detailColor);
    this.p.ellipse(-6, 0, 3, 2);
    this.p.ellipse(6, 0, 3, 2);
    
    // Head with outline - Fixed conditional color expressions
    const headColor = damageFlash ? 
      this.p.color(160, 80, 60) : 
      this.p.color(80, 60, 40);
    this.p.fill(headColor);
    this.p.stroke(60, 40, 20); // Added outline
    this.p.strokeWeight(0.6);  // Thin outline
    this.p.ellipse(0, -6, 8, 6);
    this.p.noStroke();
    
    const innerHeadColor = damageFlash ? 
      this.p.color(140, 60, 40) : 
      this.p.color(60, 40, 20);
    this.p.fill(innerHeadColor);
    this.p.ellipse(0, -5, 6, 4);
    
    // Face - Fixed conditional color expressions
    const faceColor = damageFlash ? 
      this.p.color(255, 200, 180) : 
      this.p.color(200, 180, 150);
    this.p.fill(faceColor);
    this.p.ellipse(0, -5, 4, 2);
    this.p.fill(50, 50, 50);
    this.p.ellipse(-1, -5, 2, 1);
    this.p.ellipse(1, -5, 2, 1);
    
    // Shadow
    this.p.fill(80, 60, 40, 100);
    this.p.ellipse(0, 6, 12, 4);
  }

  private drawDiggingAnimation(damageFlash: boolean, digTimer: number) {
    const diggingColor = damageFlash ? 
      this.p.color(200, 80, 60) : 
      this.p.color(120, 100, 80);
    this.p.fill(diggingColor);
    this.p.ellipse(6, 0, 4, 4);
    
    const strokeColor = damageFlash ? 
      this.p.color(160, 60, 40) : 
      this.p.color(80, 60, 40);
    this.p.stroke(strokeColor);
    this.p.strokeWeight(1);
    this.p.line(6, 0, 12, this.p.sin(this.p.frameCount * 0.3) * 3);
    this.p.noStroke();
    this.displayDigProgress(digTimer);
  }

  private drawHealthBar(x: number, y: number, health: number, maxHealth: number) {
    const barWidth = 20;
    const barHeight = 3;
    const healthPercent = health / maxHealth;
    
    this.p.push();
    this.p.fill(0, 0, 0, 150);
    this.p.rect(x - barWidth/2, y - 20, barWidth, barHeight);
    this.p.fill(255, 50, 50);
    this.p.rect(x - barWidth/2, y - 20, barWidth * healthPercent, barHeight);
    this.p.pop();
  }

  displayDigProgress(digTimer: number) {
    let progressWidth = 30;
    let progressHeight = 4;
    let progress = digTimer / 480; // 480 frames for 8 seconds
    
    // Draw progress bar above player
    this.p.fill(0, 0, 0, 150);
    this.p.rect(-progressWidth/2, -20, progressWidth, progressHeight, 2);
    
    this.p.fill(50, 200, 50);
    this.p.rect(-progressWidth/2, -20, progressWidth * progress, progressHeight, 2);
  }

  drawResourceIndicator(x: number, y: number) {
    this.p.push();
    this.p.fill(255, 255, 100, 150);
    this.p.ellipse(x, y - 15, 5, 5);
    this.p.fill(255);
    this.p.textAlign(this.p.CENTER);
    this.p.textSize(8);
    this.p.text("E", x, y - 13);
    this.p.pop();
  }
}
