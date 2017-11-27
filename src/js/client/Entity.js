class Entity {
  constructor(name, x, y, w, h, img) {
    this.name   = name;
    this.x      = x;
    this.y      = y;
    this.width  = w;
    this.height = h;
    this.img    = img;
  }

  draw() {
    var x = this.x - player.x + WIDTH/2 ;
    var y = this.y - player.y + HEIGHT/2;

    ctx.drawImage(this.img,
      x, y,
      this.width, this.height);
  }

  update() {
    this.draw();
  }

  trace(n) {
    // n = nombre de point à afficher
    var xa = this.x - player.x + WIDTH/2;
    var ya = this.y - player.y + HEIGHT/2;
    var xb = xa+this.width;
    var yb = ya+this.height;

    ctx.font = "12px Arial";
    ctx.beginPath();
    ctx.lineWidth   = "3";
    ctx.strokeStyle = "red";
    ctx.fillStyle   = "red";
    ctx.rect(xa, ya,1, 1);
    ctx.fillText(xa + ' ; ' + ya, xa-30, ya-7);
    ctx.stroke();
    if (n > 1) {
      ctx.beginPath();
      ctx.fillStyle   = "blue";
      ctx.strokeStyle = "blue";
      ctx.rect(xb, yb, 1, 1);
      ctx.fillText(xb + ' ; ' + yb, xb, yb+10);
      ctx.stroke();
    }
    if (n > 2) {
      ctx.beginPath();
      ctx.fillStyle = "green";
      ctx.strokeStyle = "green";
      ctx.rect(xa, yb, 1, 1);
      ctx.fillText(xa + ' ; ' + yb, xa-30, yb+10);
      ctx.stroke();
    }
    if (n > 3) {
      ctx.beginPath();
      ctx.fillStyle = "yellow";
      ctx.strokeStyle = "yellow";
      ctx.rect(xb, ya, 1, 1);
      ctx.fillText(xb + ' ; ' + ya, xb, ya-7);
      ctx.stroke();
    }
  }
}

// Entité qui bouge
class MovableEntity extends Entity {
  constructor(name, x, y, spdX, spdY, w, h, img, spdA) {
    super(name, x, y, w, h, img);
    this.spdX          = spdX;
    this.spdY          = spdY;
    this.animSpd       = spdA;
    this.counterSprite = 0;
    this.isColliding   = false;
    this.direction     = 1;
    this.wantDirection = 1;
  }

  updatePosition() {
    if (this.x % size | this.y % size)      // avance seulement dans la grile
      this.walk(this.direction);
    else if(!this.walk(this.wantDirection)) // essaye d'avancer vers direction demandé
      this.walk(this.direction);            // sinon continue avec direction actuel
    else this.direction = this.wantDirection;           // change la direction
  }

  walk(direction) {
    if(direction == 1)              this.x += this.spdX;
    if(direction == 2)              this.y -= this.spdY;
    if(direction == 3)              this.x -= this.spdX;
    if(direction == 4)              this.y += this.spdY;
    return 1;
  }

  draw() {
    super.draw();
  }

  update() {
    this.counterSprite =
      (this.counterSprite > 2) ? 0 : this.counterSprite + this.animSpd;
    this.updatePosition();
    this.draw();
  }
}
