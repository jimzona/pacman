class Game {
  constructor(name) {
    this.id           = name;
    this.players      = {};
    this.ghosts       = {};
    this.allGhost     = 0;
    this.map          = new Maps.Maps(maps.generateMap(mapSize, mapSize), mapCellW);
    this.items        = item.genPacGom(this.map.cells);
    this.items        = item.genSuperPacGom(this.map.cells, maxSuper, this.items);
    this.start();
  }

  start() {
    var that = this;
    setInterval(function () {
      that.testOnPlayer();
      that.loopGhost();
    }, loopSpd);

    //**     bonus aléatoire à un temps aléatoire     **//
    (function loopBonus () {
      var rand = Math.round(Math.random()
        * (bonusTmpMax - bonusTmpMin) + bonusTmpMin);
      setTimeout(function () { that.bonus(); loopBonus();}, rand);
    }());
  }

  //**        gestion temps sous superpacgom        **//
  getPowerDuring(player, time) {
    if (!player in this.players) return;
    this.players[player].power = 1;
    this.players[player].powerTime = time;
    var that = this;
    var interId = setInterval(function () {
      if (player in that.players) that.players[player].powerTime -= 1000;
    }, 1000);
    setTimeout(function() {
      clearInterval(interId);
      if (player in that.players) {
        that.players[player].power = 0;
        that.players[player].powerTime = 0;
      }
    }, time);
  }

  //**                     bonus                    **//
  bonus() {
    var i = Math.random();                              // aléatoirement
    var coo  = item.genBonus(this.map.cells, this.items);
    if (!coo) return;
    var type = f.getRandomItem(
      ['n', 's', 'cherry', 'strawberry', 'orange', 'apple'],
      [0.8, 0.1, 0.05   , 0.02        ,  0.018  , 0.002  ]);
    this.items[coo.x+';'+coo.y] = {x: coo.x, y: coo.y, type: type};
    io.to(this.id).emit('bonus', this.items[coo.x+';'+coo.y]);
    if (vv) console.log("[",this.id,"] New bonus", type, "at", coo.x+';'+coo.y);
  }

  //**                   collision                  **//
  // https://developer.mozilla.org/fr/docs/Games/Techniques/2D_collision_detection
  collisionRect(e1, e2, w1, w2) {
    var h1 = w1, h2 = w2;
    if (e1.x < e2.x + w2 && e1.x + w1 > e2.x
     && e1.y < e2.y + h2 && h1 + e1.y > e2.y)
      return 1;
    return 0;
  }

  //**                un joueur perd                **//
  playerLose(name) {
    this.players[name].life -= 1;
    if (!this.players[name].life) {
      /* sauvergarder son score */
      if (!this.players[name].guest)
        bdd.saveScore(name, this.players[name].score);
      return io.to(this.id).emit('delPlayer', name);
    }
    var coo = item.getRandomCoo(this.map.cells);
    io.to(this.id).emit('die', {name: name, x: coo.x, y: coo.y});
    this.players[name].x = coo.x;
    this.players[name].y = coo.y;
  }

  //**           collision entre 2 joueurs          **//
  collisionPlayers(a) {
    for (var b in this.players) {
      if (a == b | !(this.players[a].power ^ this.players[b].power) | !this.players[b].direction)
        continue; // même joueur | aucun/les 2 sous superpacgomme | pas encore bougé
      if (this.collisionRect(this.players[a], this.players[b], 29, 29)) {
        if (vv) console.log('[',this.id,'] collision between', a, 'and', b);
        var weakest = (this.players[a].power) ? b : a;
        this.playerLose(weakest);
      }
    }
  }

  //**     collision 1 joueurs et 1 this.ghosts     **//
  collisionGhosts(a) {
    for (var g in this.ghosts) {
      if (this.collisionRect(this.players[a], this.ghosts[g], 29, 29)) {
        if (vv) console.log('[',this.id,'] collision between', a, 'and ghost n°', g);
        if (this.players[a].power) {
          this.players[a].score += 200;
          io.to(this.id).emit('delGhost', g);
          delete this.ghosts[g];
        }
        else this.playerLose(a);
      }
    }
  }

  //**collision ghost et zone joueur sous superpacgo**//
  ghostInZone(a) {
    var radius = radiusAlert * mapCellW;
    if (!this.players[a].power) return;
    for (var g in this.ghosts) {                        // 'avertie' les fantomes
      var zone = {x: this.players[a].x-radius/2, y: this.players[a].y - radius/2};
      if (this.collisionRect(zone, this.ghosts[g], radius, 29)) {
        var w = (this.players[a].powerTime < powerTmp-powerTmp/3) ? 2 : 1;
        io.to(this.id).emit('weakness',
          {id: g, weakness: w, time: this.players[a].powerTime});
        this.ghosts[g].weak = w;
        this.ghosts[g].afraidBy = a;
      }
    }
  }

  //**     tests collisions sur tous les joueurs    **//
  testOnPlayer () {
    for (var a in this.players) {
      if (!this.players[a].direction) continue; // ce joueur n'a pas commencé à jouer
      this.collisionPlayers(a); // test collision avec les autres joueurs
      this.collisionGhosts(a);  // "..." fantomes
      this.ghostInZone(a);      // fantome ds zone joueur sous superpacgom
    }
  }

  //**   compte le nombre d'obj avec tel attribut   **//
  nOfAtrWhere(obj, atr, el) {
    var n = 0;
    for (var key in obj)
      if (obj[key][atr] == el) n++;
    return n;
  }

  //**               gestion fantomes               **//
  loopGhost() {
    var nClyde = this.nOfAtrWhere(this.ghosts, "id", "clyde");
    var nPink  = this.nOfAtrWhere(this.ghosts, "id", "pinky");

    for (var id in this.ghosts) {                       // update tt le fantomes
      var oldX = this.ghosts[id].x, oldY = this.ghosts[id].y;
      this.ghosts[id].update();
      if (oldX != this.ghosts[id].x | oldY != this.ghosts[id].y)// si fantomes a bougé
        io.to(this.id).emit('moveGhost',                // envoyer coo
          {id: id, x: this.ghosts[id].x, y: this.ghosts[id].y, direction: this.ghosts[id].direction});
    }

    var newGhost = false;
    if (nClyde < maxClyde) {                            // pas assez de clyde ?
      var coo = item.getRandomCoo(this.map.cells);
      this.ghosts[this.allGhost] = new Ghost.Clyde('clyde', coo.x, coo.y, this.map, this.players);
      newGhost = true;
    }
    else if (nPink < maxPink) {                         // pas assez de pink ?
      var coo = item.getRandomCoo(this.map.cells);
      this.ghosts[this.allGhost] = new Ghost.Pinky('pinky', coo.x, coo.y, this.map, this.players);
      newGhost = true;
    }
    if (newGhost) {
      io.to(this.id).emit('addGhost',                   // les ajouter chez le client
        {id: this.allGhost, type: this.ghosts[this.allGhost].id,
          x: this.ghosts[this.allGhost].x, y: this.ghosts[this.allGhost].y});
      this.allGhost++;
    }
  }
}

module.exports = {
  Room: Game,
};
