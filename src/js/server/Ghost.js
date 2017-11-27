//****************************************************//
//*               Gestion des fantômes               *//
//*                   côté serveur                   *//
//****************************************************//
var size     = 30;
var ghostSpd = 3;

function deepCpy(obj) {
  return JSON.parse(JSON.stringify(obj))
}

class Ghost {
  constructor(id, x, y, map, players) {
    this.id   = id;
    this.x    = x;
    this.y    = y;
    this.spd  = ghostSpd;
    this.size = size-1;
    this.map  = map;
    this.players = players;
    this.direction     = 0;
    this.wantDirection = 0;
    this.isColliding   = false;
  }

  walk(direction) {
    var oldX = this.x;
    var oldY = this.y;
    if(direction == 1)              this.x += this.spd;
    if(direction == 2)              this.y -= this.spd;
    if(direction == 3)              this.x -= this.spd;
    if(direction == 4)              this.y += this.spd;
    this.isColliding = false;
    if(this.map.isColliding(this.x, this.y, this.size, this.size)) {
      this.x = oldX;
      this.y = oldY;
      this.isColliding = true;
      return 0;
    }
    return 1;
  }

  update() {
    if (this.direction && (this.x % 30 | this.y % 30))  // avance seulement dans la grile
      this.walk(this.direction);
    else if(!this.walk(this.wantDirection)) // essaye d'avancer vers direction demandé
      this.walk(this.direction);            // sinon continue avec direction actuel
    else this.direction = this.wantDirection;           // change la direction
    this.weak = 0;
  }
}

class Clyde extends Ghost {
  constructor(id, x, y, map, players) {
    super(id, x, y, map, players);
  }

  possibleDir() {
    var dirOk = [];
    for (var d of [1, 2, 3, 4]) {
      var x = this.x, y = this.y;
      switch (d) {
        case 1: x += this.spd; break;
        case 2: y -= this.spd; break;
        case 3: x -= this.spd; break;
        case 4: y += this.spd; break;
      }
      if (!this.map.isColliding(x, y, this.size, this.size)) // direction possible ?
        dirOk.push(d);
    }
    return dirOk;
  }

  possibleDirWeak() {
    var dirOk = this.possibleDir();
    var prevH = 100;
    for (var i = 0; i < dirOk.length; i++) {
      var x = this.x, y = this.y;
      switch (dirOk[i]) {
        case 1: x += this.spd; break;
        case 2: y -= this.spd; break;
        case 3: x -= this.spd; break;
        case 4: y += this.spd; break;
      }
      var h = heuristic({x:x, y:y}, this.players[this.afraidBy]);
      if (h > prevH) dirOk.splice(i, 1);
      else if (i-1 >= 0) dirOk.splice(i-1, 1);
    }
    return dirOk;
  }

  // "Clyde feint l'indifférence. De temps en temps, il choisit une direction au hasard"
  update() {
    var opposite = {1:3, 2:4, 3:1, 4:2};                // direction opposé
    if (this.weak) var dirOk = this.possibleDirWeak();  // dir possible(s) qd faible
    else {
      var dirOk = this.possibleDir();                   // dir possible(s) qd normal
      var i = dirOk.indexOf(opposite[this.direction]);
      if (i >= 0) dirOk.splice(i, 1);                   // évite petit aller/retour
    }
    var pick = Math.floor((Math.random() * dirOk.length));
    this.wantDirection =  dirOk[pick];                  // choisie une dir. aléatoire
    if (!this.wantDirection)                            // pas de direction possible
    this.wantDirection = opposite[this.direction];      // rebrousser chemin
    super.update();
  }
}

class Pinky extends Ghost {
  constructor(id, x, y, map, players) {
    super(id, x, y, map, players);
    this.brain    = new Astar(deepCpy(map.cells));
    this.path = [];
    this.clock    = 0;
  }

  getDir() {
    if (!this.map) return;
    var start = {x: this.map.xToRange(this.x),
      y: this.map.yToRange(this.y)};

    if (this.weak) {                                    // doit fuire
      var x   = this.map.width  - start.x;              // direction coo opposés
      var y   = this.map.height - start.y;
      var end = this.map.cooNearTo(x, y);               // coo valide près de coo opposé
      if (!(this.afraidBy in this.players)) return;
      var avoidX = this.players[this.afraidBy].x;       // point à éviter
      var avoidY = this.players[this.afraidBy].y;       // (coo du joueur)
      this.path = this.brain.search(start, end, {x:avoidX, y:avoidY});
    }
    else {                                              // doit trouver
      var ends = [];
      for (var k in this.players)
      if (this.players[k].direction) // ajouter cible ssi player ready
      ends.push({x: this.map.xToRange(this.players[k].x),
        y: this.map.yToRange(this.players[k].y)});

        this.path = this.brain.searchs(start, ends);    // récupére le chemin vers la cible la plus proche
    }
    for (var i = 0; i < this.path.length; i++) {        // converti points en coo
      this.path[i] = {x: this.map.CooToX(this.path[i].x),
                      y: this.map.CooToY(this.path[i].y)};
    }
  }

  // "Blinky attaque directement Pac Man. Il suit Pac-Man comme son ombre."
  update() {
    if (this.clock++ > 10) { this.getDir(); this.clock = 0; }
    if (!this.path.length) return;
    var x  = this.path[0].x, y = this.path[0].y;
    if (this.x == x && this.y == y)  {
      this.path.shift();
      if (!this.path.length) return;
      x  = this.path[0].x, y = this.path[0].y;
    }
    var dx = this.x - x,    dy = this.y - y;
    if (dx < 0)       this.wantDirection = 1;
    else if (dy > 0)  this.wantDirection = 2;
    else if (dx > 0)  this.wantDirection = 3;
    else if (dy < 0)  this.wantDirection = 4;
    super.update();
  }
}

//****************************************************//
//*               class aide recherche               *//
//****************************************************//
function haveSameCoo(a, b) {
  return a.x == b.x && a.y == b.y;
}

function heuristic(a, b, start) {                       // Manhattan distance (4 dir)
  // fournit rapidement/aproximativent une distance entre a et b
  var dx  = a.x - b.x;
  var dy  = a.y - b.y;
  var dx2 = (start) ? start.x - b.x : 1;
  var dy2 = (start) ? start.y - b.y : 1;
  return Math.abs(dx*dy2 - dx2*dy) * 1.00001;
}

class Astar {
  constructor(grid) {
    this.grid = grid;
    this.height = grid.length;
    this.width  = grid[0].length;
  }

  init() {
    for (var y = 0; y < this.height; y++) {
      for (var x = 0; x < this.width; x++) {
        var wall = (typeof(this.grid[y][x].wall) == 'undefined') ?
          this.grid[y][x] : this.grid[y][x].wall;
        this.grid[y][x]   = {x: x, y: y, wall: wall};
        this.grid[y][x].f = 0;            // coût point du début -> ce point
        this.grid[y][x].g = 0;            // coût total (début -> but)
        this.grid[y][x].h = 0;            // coût heuristique (début -> but)
        this.grid[y][x].p = null;         // parent
        this.grid[y][x].visited = false;  // visité ?
        this.grid[y][x].closed  = false;  // fermé ?
      }
    }
  }

  searchs(start, ends) {
    if (!ends) return [];
    var lowEnd = {};
    for (var i = 0; i < ends.length; i++) {
      ends[i].h = heuristic(start, ends[i], start);     // cherche le plus prêt
      if (!lowEnd.h | lowEnd.h > ends[i].h) lowEnd = ends[i];
    }
    return this.search({x: start.x, y: start.y}, {x: lowEnd.x, y: lowEnd.y});
  }

  search(start, end, avoid = {}) {
    this.init();
    var openList   = [];
    start.g = 0;
    openList.push(start);

    while(openList.length > 0) {
      // cherche le coût f le petit
      var lowInd = 0;
      for(var i = 0; i < openList.length; i++)
        if(openList[i].f < openList[lowInd].f) lowInd = i;
      var currentNode = openList[lowInd];

      // FIN : si point courrant == but
      if (haveSameCoo(currentNode, end)) {
        var ret  = [];
        var curr = currentNode;
        while (curr.p) {
          ret.push(curr);
          curr = curr.p;
        }
        return ret.reverse(); // -> chemin
      }

      // transvase point courrant de open vers closed liste, regarde les voisins
      openList = openList.filter(e => !haveSameCoo(e, currentNode));
      currentNode.closed = true;

      var neighbors = this.neighbors(currentNode);
      for (var i = 0; i < neighbors.length; i++) {
        var neighbor = neighbors[i];
        if (neighbor.closed                             // ignore voisins déjà évalués
         || this.grid[neighbor.y][neighbor.x].wall)     // et murs
          continue;
        if (neighbor.y == avoid.y && neighbor.x == avoid.x) // ignore point demandé
          continue;

          // g est la + petite distance, regarder si
          // le chemin jusqu'à ce point est le plus petit de tous
          var gScore = currentNode.g + 1;
          var gScoreIsBest = false;

          if(!neighbor.visited) {                       // jms vue ce point
            gScoreIsBest = true;
            neighbor.visited = true;
            neighbor.h       = heuristic(neighbor, end, start);
            openList.push(neighbor);
          }
          else if (gScore < neighbor.g)                 // déjà vue, ms g meilleur
            gScoreIsBest = true;

          if (gScoreIsBest) {
            neighbor.p = currentNode;
            neighbor.g = gScore;
            neighbor.f = neighbor.g + neighbor.h;
          }
      }
    }

    return -1;  // erreur, aucun chemin trouvé
  }

  neighbors(node) {
    var all = [];
    var x = node.x, y = node.y;
    if(y-1 >= 0 && this.grid[y-1][x].wall == 0)
      all.push(this.grid[y-1][x]);
    if(y+1 < this.height && this.grid[y+1][x].wall == 0)
      all.push(this.grid[y+1][x]);
    if(x-1 >= 0 && this.grid[y][x-1].wall == 0)
      all.push(this.grid[y][x-1]);
    if(x+1 < this.width && this.grid[y][x+1].wall == 0)
      all.push(this.grid[y][x+1]);
    return all;
  }

}

module.exports = {
  Clyde: Clyde,
  Pinky: Pinky,
};
