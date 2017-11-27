//**            rejoinde/creer une salle            **//
a = 0;
exports.joinRoom = function(client, room, callback) {
  if (room)
    var roomOk = f.changeRoom(client, room)
  if (!roomOk) {
    var room = lessFilledRoom();
    if (!room) {                                          // pas de salle disponible
      do {                                                // lui donner un nom aléatoire
        room = Math.random().toString(36).substring(2, 8).toUpperCase();
      } while (room in games);                            // et non utilisé
      games[room] = new Game.Room(room);
      a++;
    }
    client.room = room;
    client.join(room);
  }
  if (callback) callback();
}

exports.changeRoom = function (client, room) {
  if (games[room]) {
    var len = Object.keys(games[room].players).length;
    if (len && len <= maxPlayers) {
      if (client.room) client.leave(client.room);
      client.room = room;
      client.join(room);
      return true;
    }
  }
  return false;
}

function lessFilledRoom() { // renvoie la salle la moins pleine
  var prev = maxPlayers;
  var room;
  for (var name in games) {
    var len = Object.keys(games[name].players).length;
    if (len < prev) {
      prev = len;
      room = name;
    }
  }
  return room;
}

//**                   connection                   **//
exports.connect = function(client, type, init, stay) {
  if (!init) return;
  var len = Object.keys(games[client.room].players).length;
  if (len >= maxPlayers) {                              // trop de joueur ds la salle
    client.leave(client.room);                          // la quitter
    f.joinRoom(client);                                 // en joindre une autre
    console.log(client.room);
    client.emit("party-ok", client.room);
  }
  if (v) console.log('[',client.room,']', type + client.name, 'is connected');
  client.broadcast.to(client.room).emit('addPlayer', {  // le dire aux autres joueurs
    id: client.name, x: init.x, y: init.y
  });
  games[client.room].players[client.name]
    = {x: init.x, y: init.y, power: 0, life: life, score: 0, guest: (type) ? true : false};
  var token;
  if (stay) {
    token = uuidv4();
    playersToken[token] = client.name;
  }
  var endCookie = new Date(Date.now() + cookieTime);
  client.emit('login-ok', {name: client.name, token: token, time: endCookie});
}

//**                lecture cookies                 **//
// https://www.quirksmode.org/js/cookies.html
exports.readCookie = function(cookie = '', name) {
	var nameEQ = name + "=";
	var ca = cookie.split(';');
	for(var i = 0; i < ca.length; i++) {                  // pr chq cookies
		var c = ca[i];
		while (c.charAt(0)==' ')
      c = c.substring(1,c.length);                      // enléve le(s) espace(s)
		if (c.indexOf(nameEQ) == 0)                         // si commence par le bon nom
      return c.substring(nameEQ.length,c.length);       // renvoie sa valeur
	}
	return null;                                          // cookie pas trouvé
}

exports.getRandomItem = function(l, w) {
  var totalW = +w.reduce((a, b) => a + b).toFixed(2);
  var r = Math.random() * totalW;

  var sumW = 0;
  for (var i = 0; i < l.length; i++) {
    sumW += w[i];
    sumW = +sumW.toFixed(2);
    if (r <= sumW) return l[i];
  }
}
