//****************************************************//
//*            Méthode relatif au terrain            *//
//****************************************************//

class Maps {
  constructor(cells, aSize) {
    this.cells      = cells;
    this.width      = cells[0].length;
    this.height     = cells.length;
    this.size       = aSize;
  }
  valideCoCells(x, y) {                   // cellule avec coordonnées x, y existe ?
    return (x >= 0 && y >= 0
            && x < this.width && y < this.height) ? true : false;
  }

  xToRange(coo) { return Math.floor(coo/this.size);   }

  yToRange(coo) { return Math.floor(coo/this.size); }

  CooToX(coo) { return coo * this.size; }

  CooToY(coo) { return coo * this.size; }

  isWall(xa,ya) {
    if (xa < 0 || xa >= this.width)  return true;
    if (ya < 0 || ya >= this.height) return true;
    return this.cells[ya][xa];
  }

  isColliding(x, y, w, h) {
    // 1 angle d'un objet dans cellule avec un mur (cellule=1)
    var xa = this.xToRange(x);
    var ya = this.yToRange(y);
    var xb = this.xToRange(x + w);
    var yb = this.yToRange(y + h);
    return (this.isWall(xa, ya) || this.isWall(xa, yb) ||
            this.isWall(xb, ya) || this.isWall(xb, yb));
  }

  cooNearTo(x, y) {
    if (!this.isWall(x, y)) return {x: x, y:y};
    var s = 1, v;
    while (v = this.neighbors(x, y, s++)) {
      for (var i = 0; i < v.length; i++)
        if (!this.isWall(v[i].x, v[i].y))
          return {x: v[i].x, y: v[i].y};
    }
  }

  neighbors(x, y, size = 1) {
    var all = [];
    for (var xi = -size; xi <= size; xi++)
      for (var yi = -size; yi <= size; yi++) {
        if (!xi && !yi) continue; // x;y
        if (this.valideCoCells(x+xi, y+yi))
          all.push({x: x+xi, y: y+yi});
      }
    return all;
  }
}

if (typeof exports !== 'undefined')
  module.exports = {Maps: Maps};
