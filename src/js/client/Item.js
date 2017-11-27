class Item extends Entity {
  constructor(name, x, y, sx, sy) {
    super(name,
      mapcell.CooToX(x), mapcell.CooToY(y),
      30, 30, Img.items);
    this.sx = sx;                                       // start x in the sprit
    this.sy = sy;                                       // start y in the sprit
  }

  draw() {
    var x = this.x - player.x + WIDTH/2 ;
    var y = this.y - player.y + HEIGHT/2;

    ctx.drawImage(this.img,
      this.sx, this.sy, 30, 30, x, y,
      this.width, this.height);
  }
}

class Pacgomme extends Item {
  constructor(x, y) {
    super('#pacgomme', x, y, 0, 0);
    this.value = 10;
    this.width = 18;
    this.height = 18;
    this.x += (30-this.width)/2;                        // centrage x
    this.y += (30-this.height)/2;                       // centrage y
  }
}

class SuperPacgomme extends Item {
  constructor(x, y) {
    super('#superpacgomme', x, y, 0, 0);
    this.value = 50;
  }
}

class Cherry extends Item {
  constructor(x, y) {
    super('#cherry', x, y, 30, 0);
    this.value = 100;
  }
}

class Strawberry extends Item {
  constructor(x, y) {
    super('#strawberry', x, y, 60, 0);
    this.value = 300;
  }
}

class Orange extends Item {
  constructor(x, y) {
    super('#orange', x, y, 0, 30);
    this.value = 500;
  }
}

class Apple extends Item {
  constructor(x, y) {
    super('#apple', x, y, 30, 30);
    this.value = 700;
  }
}
