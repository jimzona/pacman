//****************************************************//
//*               Affichage du terrain              *//
//****************************************************//

class DrawableMap extends Maps {
  constructor(cells, w, h, aCellSize) {
    super(cells, w, h, aCellSize);
    this.img      = Img.map;
    this.betterCells();
  }

  betterCells() {
    for (var yi = 0; yi < this.height; yi++)
      for (var xi = 0; xi < this.width; xi++) {
        if (this.isWall(xi, yi)) {
          var walls = this.wallNear(xi, yi)
          this.cells[yi][xi] = parseInt(walls, 2) + 1;   // convertie str->binaire->int
        }
      }
  }

  wallNear(x, y) {  // retourne un str signalant les 4 voisins (0=pas de mur, 1=mur)
    var m = '';
    for (var yi = -1; yi < 2; yi++) {
      for (var xi = -1; xi < 2; xi++) {
        if ((yi && xi) || (!yi && !xi)) continue;
        if (this.cells[y+yi] && this.cells[y+yi][x+xi]) m += 1;
        else m += 0;
      }
    }
    return m;
  }

  draw() {
    var x = WIDTH/2 - player.x;           // centrer en x par rapport a player
    var y = HEIGHT/2 - player.y;          // centrer en y par rapport a player

    // générer du terrain
    // if (y+this.height*this.size < HEIGHT) console.log("gen y max");
    // if (y > 0)                                  console.log("gen y 0");
    // if (x+this.width*this.size < WIDTH)     console.log("gen x max");
    // if (x > 0)                                  console.log("gen x 0");
    var frameW = 128/4;

    for (var yi = 0; yi < this.height; yi++)
      for (var xi = 0; xi < this.width; xi++) {
        var frameX = this.cells[yi][xi] % 4;
        var frameY = Math.floor(this.cells[yi][xi] / 4);
        ctx.drawImage(this.img,
          frameW*frameX, frameW*frameY,
          this.size, this.size,
          x+xi*this.size, y+yi*this.size,
          this.size, this.size);
      }
  }

}
