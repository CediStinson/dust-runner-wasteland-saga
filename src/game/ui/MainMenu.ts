
export function renderMainMenu(p: any): boolean {
  // Draw background
  p.background(20, 18, 24);
  
  // Draw stars
  p.fill(255, 255, 255);
  for (let i = 0; i < 100; i++) {
    const x = p.random(p.width);
    const y = p.random(p.height);
    const size = p.random(1, 3);
    const brightness = p.random(150, 255);
    p.fill(brightness);
    p.ellipse(x, y, size, size);
  }
  
  // Draw large desert dune silhouette
  p.fill(50, 30, 20);
  p.beginShape();
  p.vertex(0, p.height);
  p.vertex(0, p.height * 0.7);
  for (let x = 0; x <= p.width; x += 50) {
    const y = p.height * 0.7 + p.sin(x * 0.01) * 50;
    p.vertex(x, y);
  }
  p.vertex(p.width, p.height);
  p.endShape(p.CLOSE);
  
  // Draw title text with glow effect
  const titleText = "DUST RUNNER: WASTELAND SAGA";
  p.textSize(42);
  p.textAlign(p.CENTER);
  p.textFont('Courier New');
  
  // Glow effect
  p.fill(255, 220, 150, 30);
  for (let i = 10; i > 0; i--) {
    p.text(titleText, p.width/2, p.height/3 + i);
    p.text(titleText, p.width/2 + i, p.height/3);
    p.text(titleText, p.width/2 - i, p.height/3);
  }
  
  // Main text
  p.fill(255, 220, 150);
  p.text(titleText, p.width/2, p.height/3);
  
  // Draw start button
  const btnWidth = 200;
  const btnHeight = 50;
  const btnX = p.width/2 - btnWidth/2;
  const btnY = p.height/2 + 30;
  
  const mouseOver = p.mouseX > btnX && p.mouseX < btnX + btnWidth && 
                  p.mouseY > btnY && p.mouseY < btnY + btnHeight;

  const fillColor = mouseOver ? [255, 220, 150] : [200, 170, 100];
  p.fill(...fillColor);
  
  let startClicked = false;
  if (mouseOver && p.mouseIsPressed) {
    startClicked = true;
  }
  
  p.rect(btnX, btnY, btnWidth, btnHeight, 5);
  p.fill(40, 30, 20);
  p.textSize(24);
  p.text("START GAME", p.width/2, btnY + 32);
  
  // Draw subtitle text
  p.fill(200, 180, 150);
  p.textSize(16);
  p.text("Survive the harsh desert. Collect resources. Upgrade your hoverbike.", p.width/2, p.height/2 - 20);
  
  return startClicked;
}
