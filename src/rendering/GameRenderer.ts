
import p5 from 'p5';

export class GameRenderer {
  private p: any;
  private worldGenerator: any;
  private player: any;
  private hoverbike: any;
  private worldX: number;
  private worldY: number;
  private timeOfDay: number;

  constructor(
    p: any, 
    worldGenerator?: any, 
    player?: any, 
    hoverbike?: any, 
    worldX?: number, 
    worldY?: number, 
    timeOfDay?: number
  ) {
    this.p = p;
    this.worldGenerator = worldGenerator;
    this.player = player;
    this.hoverbike = hoverbike;
    this.worldX = worldX || 0;
    this.worldY = worldY || 0;
    this.timeOfDay = timeOfDay || 0.25;
  }

  render() {
    // Render the world
    // You can expand this method to use the properties for sophisticated rendering
    console.log("Rendering game at world position:", this.worldX, this.worldY);
    console.log("Time of day:", this.timeOfDay);
  }

  setTimeOfDay(time: number) {
    this.timeOfDay = time;
  }

  drawHut(obs: any) {
    this.p.push();
    this.p.translate(obs.x, obs.y);
    
    // Load and draw the hut sprite with the correct filename
    const hutSprite = this.p.loadImage('src/pixelartAssets/desert-hut-pixilart.png');
    this.p.image(hutSprite, -32, -32, 64, 64); // Adjust size as needed for the sprite

    this.p.pop();
  }
}
