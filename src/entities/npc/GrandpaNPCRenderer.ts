
export class GrandpaNPCRenderer {
  private p: any;
  constructor(p: any) {
    this.p = p;
  }

  displayGrandpa(): void {
    const p = this.p;
    // Grandpa body (same size as player)
    p.push();

    // Shoes
    p.fill(80, 50, 30);
    p.ellipse(-5, 11, 4, 2.5);
    p.ellipse(5, 11, 4, 2.5);

    // Shadow
    p.fill(0, 0, 0, 40);
    p.ellipse(0, 5, 12, 5);

    // Pants
    p.fill(110, 110, 130);
    p.rect(-3, 6, 6, 7, 2);

    // Shirt (grandpa style, muted color, visible collar)
    p.fill(170, 170, 190);
    p.rect(-5, 0, 10, 12, 4);

    // Collar
    p.fill(200);
    p.triangle(-2, 0, 0, 2, 2, 0);

    // Belt
    p.fill(70, 60, 45);
    p.rect(-5, 7, 10, 2, 1);

    // Head (bald on top, fringe of white/grey hair)
    p.fill(220, 200, 170); // Skin color
    p.ellipse(0, -8, 10, 11);

    // Grey/white hair fringe
    p.fill(220);
    p.arc(0, -8, 10, 11, p.PI * 0.8, p.PI * 0.2, p.OPEN);
    // Side whiskers
    p.fill(200,200,200);
    p.ellipse(-4.5, -7, 3, 3);
    p.ellipse(4.5, -7, 3, 3);

    // Eyebrows
    p.stroke(100);
    p.strokeWeight(0.7);
    p.line(-2, -11, 0, -10.5);
    p.line(2, -11, 0, -10.5);

    // Eyes (gentle/friendly)
    p.noStroke();
    p.fill(40, 40, 55);
    p.ellipse(-1.7, -8, 1.2, 1.6);
    p.ellipse(1.7, -8, 1.2, 1.6);

    // Glasses
    p.noFill();
    p.stroke(120);
    p.ellipse(-1.7, -8, 2, 1.7);
    p.ellipse(1.7, -8, 2, 1.7);
    p.line(-0.7, -8, 0.7, -8);

    // Nose
    p.noStroke();
    p.fill(190, 170, 140);
    p.ellipse(0, -7, 1.3, 0.7);

    // Mustache
    p.fill(220);
    p.ellipse(0, -6.3, 3.3, 0.9);

    // Mouth (gentle smile)
    p.noFill();
    p.stroke(120, 80, 60);
    p.arc(0, -5.5, 2.4, 1.5, 0, p.PI);

    // Cane (optional, right of body)
    p.stroke(90, 60, 30);
    p.strokeWeight(2);
    p.line(6, 2, 7, 12);
    p.strokeWeight(1);

    p.pop();
  }
}
