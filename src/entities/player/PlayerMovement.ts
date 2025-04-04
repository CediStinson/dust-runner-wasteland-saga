
export default class PlayerMovement {
  private p: any;

  constructor(p: any) {
    this.p = p;
  }

  handleInput(player: any) {
    const { speed } = player;
    let moveX = 0, moveY = 0;
    
    if (this.p.keyIsDown(this.p.UP_ARROW)) moveY -= speed;
    if (this.p.keyIsDown(this.p.DOWN_ARROW)) moveY += speed;
    if (this.p.keyIsDown(this.p.LEFT_ARROW)) moveX -= speed;
    if (this.p.keyIsDown(this.p.RIGHT_ARROW)) moveX += speed;

    let magnitude = this.p.sqrt(moveX * moveX + moveY * moveY);
    if (magnitude > 0) {
      moveX /= magnitude;
      moveY /= magnitude;
      player.angle = this.p.atan2(moveY, moveX);
    }

    player.velX += moveX * speed * 0.2;
    player.velY += moveY * speed * 0.2;
    
    // Check for E key to collect metal or interact with copper
    if (this.p.keyIsDown(69)) { // 'E' key
      player.collectResource();
    }
  }

  applyFriction(player: any) {
    player.velX *= 0.9;
    player.velY *= 0.9;
  }

  checkCollisions(player: any) {
    let willCollide = false;
    let currentObstacles = player.obstacles[`${player.worldX},${player.worldY}`] || [];
    let newX = player.x + player.velX;
    let newY = player.y + player.velY;
    
    for (let obs of currentObstacles) {
      if (obs.type === 'rock' || obs.type === 'hut' || obs.type === 'fuelPump') {
        let dx = newX - obs.x;
        let dy = newY - obs.y;
        
        let collisionRadius = 0;
        if (obs.type === 'rock') {
          let hitboxWidth = 28 * obs.size * (obs.aspectRatio > 1 ? obs.aspectRatio : 1);
          let hitboxHeight = 28 * obs.size * (obs.aspectRatio < 1 ? 1 / this.p.abs(obs.aspectRatio) : 1);
          collisionRadius = (hitboxWidth + hitboxHeight) / 2 / 1.5;
        } else if (obs.type === 'hut') {
          collisionRadius = 30; // Hut collision radius
        } else if (obs.type === 'fuelPump') {
          collisionRadius = 25; // Fuel pump collision radius
        }
        
        let distance = this.p.sqrt(dx * dx + dy * dy);
        if (distance < collisionRadius) {
          willCollide = true;
          break;
        }
      }
    }
    
    return willCollide;
  }

  move(player: any) {
    if (this.checkCollisions(player)) {
      // Stop movement if collision would occur
      player.velX *= -0.5;
      player.velY *= -0.5;
    } else {
      player.x += player.velX;
      player.y += player.velY;
      
      // Check for cactus damage after moving
      player.checkCactusDamage();
    }
  }
}
