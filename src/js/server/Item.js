genPacGom = function (map) {
  var coo = {};
  for (var yi = 0; yi < map.length; yi++)
    for (var xi = 0; xi < map[0].length; xi++)
      if (!map[yi][xi])                                 // si cellule vide
        coo[xi+';'+yi] = {x: xi, y: yi, type: 'n'};     // ajoute coo de la cellule
  return coo;
}

genSuperPacGom = function (map, maxItem, coo) {
  var arr = [];
  for (key in coo) {
    var voisine = getNbV(map, coo[key].x, coo[key].y);  // recupére le nb de voisine
    if (voisine >= 5)                                   // si plus que 5
      arr.push(key);                                    // ajoute coo de la cellule
  }
  arr = randReduce(arr, maxItem);                       // reduie maxItem coordonnées
  for (var i = 0; i < arr.length; i++)
    coo[arr[i]].type = 's';
  return coo;
}

getNbV = function (map, x, y) {
  var h = map.length;
  var w = map[0].length;
  var n = 0, xi, yi;
  var voisines = [  [x-1, y-1], [x, y-1], [x+1, y-1],
                    [x-1, y],             [x+1,  y],
                    [x-1, y+1], [x, y+1], [x+1, y+1] ];
  for (var co = 0; co < 8; co++) {
    xi = voisines[co][0];
    yi = voisines[co][1];
    if (yi < 0 | xi < 0 | yi >= h | xi >= w) continue;
    if (map[yi][xi]) n++;
  }
  return n;
}                        // cherche nombre de voisine

randReduce = function (arr, max) {                      // prend max item aléatoirement
  var red = []
  while (max) {
    red.push(arr[Math.floor(Math.random()*arr.length)]);
    max--;
  }
  return red;
}

genBonus = function (map, items) {
  var arr = [];
  for (var yi = 0; yi < map.length; yi++)
    for (var xi = 0; xi < map[0].length; xi++)
      if (!(xi+';'+yi in items) & !map[yi][xi])
        arr.push({x: xi, y: yi});
  return randReduce(arr, 1)[0];
}

getRandomCoo = function (map) {
  var arr = [], h = map.length, w = map[0].length;
  for (var yi = 0; yi < h; yi++)
    for (var xi = 0; xi < w; xi++)
      if (!map[yi][xi]) arr.push({x: xi, y: yi});
  var coo = randReduce(arr, 1)[0];
  return {x: coo.x*30, y: coo.y*30};
}

module.exports.genSuperPacGom = genSuperPacGom;
module.exports.genPacGom = genPacGom;
module.exports.genBonus = genBonus;
module.exports.getRandomCoo = getRandomCoo;
