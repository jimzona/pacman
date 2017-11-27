//****************************************************//
//*               Gestion des fantômes               *//
//*                                                  *//
//****************************************************//
// Objet fantômes
var spdAnim = 0.3;

class Ghost extends Entity {
  constructor(name, x, y, w, h, weak) {
    var img = new Image();
    switch (name) {
      case 'clyde': img = Img.clyde; break;
      case 'pinky': img = Img.pinky; break;
    }
    super(name, x, y, w, h, img);
    this.direction     = 0;
    this.animSpd       = spdAnim;
    this.counterSprite = 0;
    this.weak          = weak;
    this.weakImg       = Img.ghostWB;
  }

  draw() {
    var frameW = 256/8;
    var frame  = [,0,2,4,6][this.direction];
    var img    = this.img;

    if (this.weak) {
      img   = this.weakImg;
      frame = 0;
    }
    if (this.weak == 2) frame += 1;
    if (this.counterSprite > 1) frame += 1;

    var x = this.x - player.x + WIDTH/2 ;
    var y = this.y - player.y + HEIGHT/2;

    ctx.drawImage(img,
      frameW*frame, 0, frameW, 32,
      x, y, this.width, this.height);
  }

  update() {
    this.counterSprite =
      (this.counterSprite > 2) ? 0 : this.counterSprite + this.animSpd;
    this.draw();
  }
}
