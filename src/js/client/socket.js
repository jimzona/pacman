//****************************************************//
//*                     Joueurs                      *//
//****************************************************//
var v = true;

socket.on('initGame',   function (data) {
  player = {}, items = {}, ghosts = {}, other = {};
  document.location.hash = room = data.room;
  share.value = window.location.host + '/#' + room;
  if (v) console.log('Room:', room);
  size = data.map.size;
  WIDTH_MAX   = data.map.width * size;
  HEIGHT_MAX  = data.map.height * size;
  mapcell = new DrawableMap(data.map.cells, size);      // map
  for (key in data.items) {                             // items
    var item = data.items[key];
    switch (data.items[key].type) {
      case "n":
        items[key] = new Pacgomme(item.x, item.y); break;
      case "s":
        items[key] = new SuperPacgomme(item.x, item.y); break;
      case "cherry":
        items[key] = new Cherry(item.x, item.y); break;
      case "strawberry":
        items[key] = new Strawberry(item.x, item.y); break;
      case "orange":
        items[key] = new Orange(item.x, item.y); break;
      case "apple":
        items[key] = new Apple(item.x, item.y); break;
    }
  }
  for(key in data.other)  {                             // les joueurs
    other[key] = new Player(key, data.other[key].x, data.other[key].y, Img.player, false);
    other[key].score = data.other[key].score;
    if (data.other[key].power) {
      other[key].power = 1;
      setTimeout(function () { if (key in other) other[key].power = 0;}, data.other[key].powerTime);
    }
  }
  // initialisation du joueur
  player  = new Player('local', data.x, data.y, Img.player, false);
  setInterval(gameUpdate, 60);
  setInterval(hudUpdate, 1000);
  // si déjà connecté ('stay login' coché)
  if (data.name) {
    document.getElementById('log').style.display     = 'block';
    document.getElementById('not-log').style.display = 'none';
    document.getElementById('player-name').innerHTML = data.name;
    document.getElementById('best-score').innerHTML  = data.score.best;
    document.getElementById('last-score').innerHTML  = data.score.last;
  }
});

socket.on('addPlayer',  function (data) {
  if (v) console.log('addPlayer ' + data.id);
  other[data.id] = new Player(data.id, data.x, data.y, Img.player, false);
});

socket.on('movePlayer', function (data) {
  if (other[data.id]) {
    other[data.id].x = data.x;
    other[data.id].y = data.y;
    other[data.id].direction = data.direction;
    other[data.id].isColliding = data.isColliding;
  }
});

socket.on('delPlayer',  function (name) {
  if (v) console.log('delPlayer ' + name);
  if (name == player.name)
    location.reload(true);
  else if (name in other) delete other[name];           // supprimer un joueur
});

socket.on('die',        function (data) {
  if (data.name == player.name) {
    player.life -= 1;
    player.x = data.x;
    player.y = data.y;
    player.wantDirection = 0;
  }
  else if (data.name in other) {
    other[data.name].x = data.x;
    other[data.name].y = data.y;
    other[data.name].direction = 0;
  }
});

//****************************************************//
//*                      Ghosts                      *//
//****************************************************//

socket.on('addGhost',   function (data) {
  if (v) console.log('addGhost', data);
  ghosts[data.id] = new Ghost(data.type, data.x, data.y, size, size, data.weak);
});

socket.on('moveGhost',  function (data) {
  if (ghosts[data.id]) {
    ghosts[data.id].x = data.x;
    ghosts[data.id].y = data.y;
    ghosts[data.id].direction = data.direction;
  }
});

socket.on('delGhost',   function (name) {
  if (v) console.log('delGhost ' + name);
  delete ghosts[name];
});

socket.on('weakness',   function (data) {
  if (ghosts[data.id])
    ghosts[data.id].weak = data.weakness;
  if (data.weakness == 2) {
    setTimeout(function () {
      if (ghosts[data.id]) ghosts[data.id].weak = 0;
    }, data.time);
  }
});

//****************************************************//
//*                      Items                       *//
//****************************************************//

socket.on('bonus',      function (data) {
  if (v) console.log(data);
  var key = data.x+';'+data.y
  switch (data.type) {
    case "n":
      items[key] = new Pacgomme(data.x, data.y); break;
    case "s":
      items[key] = new SuperPacgomme(data.x, data.y); break;
    case "cherry":
      items[key] = new Cherry(data.x, data.y); break;
    case "strawberry":
      items[key] = new Strawberry(data.x, data.y); break;
    case "orange":
      items[key] = new Orange(data.x, data.y); break;
    case "apple":
      items[key] = new Apple(data.x, data.y); break;
  }
});

socket.on('delItem',    function (item) {
  if (item.from == player.name)
    player.digest(item);
  else if (other[item.from])
    other[item.from].digest(item);
});

//****************************************************//
//*                  Login/Register                  *//
//****************************************************//

socket.on('login-ok',   function (data) {
  player.local = true;
  player.name  = data.name;
  if (data.token)
    document.cookie = 'id=' + data.token + '; expires=' + data.time;
  hideCon();
});

socket.on('register-ok', function (msg) {
  alert(msg);
  location.reload();
});

socket.on('log-fail',   function (msg) {
  var elem = document.getElementsByClassName('error')[0];
  elem.innerHTML = msg;
  setTimeout(function () {elem.innerHTML = '';}, 4000)
});

socket.on('party-ok',   function (newRoom) {
  document.location.hash = newRoom;
  location.reload(true);
});

socket.on('party-fail', function (msg) {
  var elem = document.getElementsByClassName('error')[1];
  elem.innerHTML = msg;
  setTimeout(function () {elem.innerHTML = '';}, 8000)
});

//*                   Info console                   *//

socket.on('info',   function (data) {
  if (v) console.log(data);
});
