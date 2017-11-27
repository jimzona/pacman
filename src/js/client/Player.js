//****************************************************//
//*               Gestion des joueurs                *//
//*                                                  *//
//****************************************************//
var speed   = 5;
var spdAnim = 0.3;

class Player extends MovableEntity {
  constructor(name, x, y, img, local) {
    super(name, x, y, speed, speed, size-1, size-1, img, spdAnim);
    this.local = local;
    this.score = 0;
    this.life  = 1;
    this.subScore = 0;
    this.power = 0;
    this.wantDirection = 0;
  }

  walk(direction) {
    var oldX = this.x;
    var oldY = this.y;
    super.walk(direction);
    // position pas correct
    if(this.x < 0)                      this.x =  WIDTH_MAX - 1 - this.width;  // peut buger
    if(this.x+this.width > WIDTH_MAX)   this.x = 0;
    if(this.y < 0)                      this.y =  HEIGHT_MAX - 1 - this.height; // peut buger
    if(this.y+this.height > HEIGHT_MAX) this.y = 0;
    // collision
    this.isColliding = false;
    if(mapcell.isColliding(this.x, this.y, this.width, this.height)) {
      this.x = oldX;
      this.y = oldY;
      this.isColliding = true;
      return 0;
    }
    return 1;
  }

  digest(item) {
    this.score += item.val;
    this.subScore += item.val;
    if (item.val == 50) {
      this.power = 1;
      var that = this;
      setTimeout(function () { that.power = 0;}, 8000);
    }
    delete items[item.id];
  }

  eat() {
    var diffX = 0, diffY = 0;   // diff pour manger ssi centré
    if (this.direction == 2) diffY = this.height;
    if (this.direction == 3) diffX = this.width;
    var y = mapcell.yToRange(this.y+diffY);
    var x = mapcell.xToRange(this.x+diffX);
    if (x+';'+y in items && this.wantDirection)
      socket.emit('IeatThat', {id: x+';'+y, value: items[x+';'+y].value});
    if (this.subScore > 10000) {
      this.life++;
      this.subScore = this.score - 10000;
    }
  }

  updatePosition() {
    if(this.local) {
      super.updatePosition();
      this.eat();
      socket.emit('myPosIs',
        {id: this.name, type: "player", x: this.x, y: this.y, direction: this.direction, isColliding: this.isColliding} );
    }
  }

  draw() {
    var frameW = 160/5;
    var frame  = this.direction;
    // animation
    if (!this.isColliding && this.counterSprite > 1) frame = 0;

    var x = this.x - player.x + WIDTH/2;    // centrer en x par rapport a player;
    var y = this.y - player.y + HEIGHT/2;   // centrer en y par rapport a player

    // dessine
    ctx.drawImage(this.img,
      frameW*frame, 0, frameW, 32,
      x, y, this.width, this.height);
    if (this.power) {
      frame = (this.counterSprite < 0.4) ? 0 :
              (this.counterSprite < 0.8) ? 1 :
              (this.counterSprite < 1.2) ? 2 :
              (this.counterSprite < 1.8) ? 3 : 4;
      ctx.drawImage(this.img,
        frameW*frame, 32, frameW, 32,
        x-2, y-2, this.width+4, this.height+4);
    }
    this.displayName();
  }

  displayName() {
    if (this.local) return;       // pas besoin d'afficher ntr nom chez ns
    if (!this.direction) return;  // si pas enore bougé
    ctx.beginPath();
    ctx.font = '10px "Press Start 2P"';
    ctx.fillStyle   = "#fff";
    ctx.strokeStyle = "#fff";
    var x = this.x - player.x + WIDTH/2;
    var y = this.y - player.y + HEIGHT/2 - 5;
    if (this.direction == 1) this.printRight = 1;
    if (this.direction == 3) this.printRight   = 0;
    if (this.printRight)
      x -= this.name.length*10;
    else x += this.width;
    ctx.fillText(this.name, x, y+10);
    ctx.stroke();
  }

}
