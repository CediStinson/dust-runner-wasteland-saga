
drawHut(obs: any) {
  this.p.push();
  this.p.translate(obs.x, obs.y);
  
  // Load and draw the hut sprite with the correct filename
  const hutSprite = this.p.loadImage('src/pixelartAssets/desert-hut-pixilart.png');
  this.p.image(hutSprite, -32, -32, 64, 64); // Adjust size as needed for the sprite

  this.p.pop();
}
