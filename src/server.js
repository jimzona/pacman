require('./js/server/require');

app.disable('x-powered-by');

server.listen(gameport);     // écoute sur le port donné
if(vv) console.log('\t :: Express :: Listening on port ' + gameport);

//**                   connection                   **//
var endCookie = new Date(Date.now() + cookieTime);
//****************************************************//
//*                     Routage                      *//
//****************************************************//
app.get( '/', function(req, res){            // homepage
  res.sendFile( __dirname + '/index.html' );
});

app.get( '/*', function( req, res, next ) {     // files
  var file = req.params[0];
  if(vv) console.log('\t :: Express :: file requested : ' + file);
  res.sendFile( __dirname + '/' + file );
});

//****************************************************//
//*                Connection socket                 *//
//****************************************************//
io.on('connection', function(client) {  // client arrive
  if (vv) console.log('\t :: Socket.io :: User connected');
  var init, token;
  function sendData(scores) {                           // pour appel en cascade/callback
    init = item.getRandomCoo(games[client.room].map.cells);
    client.emit('initGame', {
      room : client.room,
      map  : games[client.room].map,
      items: games[client.room].items,
      other: games[client.room].players,
      x    : init.x,
      y    : init.y,
      name : client.name,
      score: scores
    });
    for (var key in games[client.room].ghosts)          // ajouter les fantômes
    client.emit('addGhost', {
      id  : key,
      type: games[client.room].ghosts[key].id,
      x   : games[client.room].ghosts[key].x,
      y   : games[client.room].ghosts[key].y
    });
  }
  f.joinRoom(client, client.handshake.query.room, function() {
    /*      si déjà connecté ('stay login' coché)     */
    token = f.readCookie(client.handshake.headers.cookie, 'id');
    if (token in playersToken) {
      client.name = playersToken[token];
      bdd.getScores(client.name, sendData);
    }
    else sendData();
  });


  //**               demande de login               **//
  client.on('login',      function (form)       {
    if (client.name)                                    // déjà connecté ?
      return f.connect(client, '', init);
    if (!form.pseudo | !form.pass)
      return client.emit('log-fail', "* All field is required");
    bdd.con.query('SELECT * FROM users WHERE pseudo = ?', [form.pseudo],
      function (err, results, fields) {
        if (err) throw err;
        if (results[0]) {
          bcrypt.compare(form.pass, results[0].pass, function (err, match) {
            if (match) {
              client.name = form.pseudo;
              f.connect(client, '', init, form.stay);
            }
            else client.emit('log-fail', "* Bad password");
          });
        }
        else client.emit('log-fail', "* Bad login");
      });
  });

  //**             demande d'inscription            **//
  client.on('register',   function (form)       {
    if (!form.pseudo | !form.pass | !form.email)
      return client.emit('log-fail', "* All field is required");
    if (!/^[a-zA-Z0-9]{1,40}$/.test(form.pseudo))
      return client.emit('log-fail', "* Pseudo with invalid character(s)");
    if (!/^.{8,30}$/.test(form.pass))
      return client.emit('log-fail', "* Your password needs to be between 8 and30 characters long");
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(form.email))
      return client.emit('log-fail', "* Please enter a valid e-mail address");
    bcrypt.hash(form.pass, saltRnds, function(err, hash) {
      form.pass = hash;
      bdd.con.query('INSERT INTO users SET ?', form, function (err, result) {
        if (err) {
          if (err.code == 'ER_DUP_ENTRY')
            return client.emit('log-fail', " * Pseudo already used");
          else throw err;
        }
        if (v) console.log('New User:',form.pseudo,'(',form.email,')');
        client.emit('register-ok', " You can now login!");
      });
    });
  });

  //**          demande à changer de salle          **//
  client.on('changeRoom', function (wantedRoom) {
    var prevRoom = client.room;
    var s = f.changeRoom(client, wantedRoom);
    if (s) client.emit('party-ok', wantedRoom);
    else   client.emit('party-fail', 'There was a problem joining that party, please make sure the code is correct, or try creating another party');
  });

  //**       demande à jouer en tant qu'invité      **//
  client.on('guest',      function (form)       {
    do {                 // nom aléatoire et non utilisé
      var name = Math.random().toString(36).substring(2, 8);
    } while (name in games[client.room].players);
    client.name = name;
    f.connect(client, 'Guest ', init);
  });

  //**                 deconnection                 **//
  client.on('disconnect', function ()           {
    if (client.name) {                                  // si joueur initialisé
      if(v) console.log('[',client.room,']', client.name, 'quit the game');
      delete games[client.room].players[client.name];    // actualisation liste
      client.broadcast.to(client.room).emit('delPlayer', client.name);
    }
  });

  //**         une entité change de position        **//
  client.on('myPosIs',    function (e)          {
    if (e.type == "player" && games[client.room].players[client.name]) {
      games[client.room].players[client.name].x = e.x;   // enregistre ses infos
      games[client.room].players[client.name].y = e.y;   // dans la liste
      games[client.room].players[client.name].direction   = e.direction;
      games[client.room].players[client.name].isColliding = e.isColliding;
      client.broadcast.to(client.room).emit('movePlayer',
        {id: client.name, x: e.x, y: e.y,
         direction: e.direction, isColliding: e.isColliding} );
    }
  });

  //**            un joueur mange un item           **//
  client.on('IeatThat',   function (item)       {
    io.to(client.room).emit('delItem',
      {from: client.name, id: item.id, val: item.value});
    if (client.name in games[client.room].players)
      games[client.room].players[client.name].score += item.value;
    if (item.value == 50)
      games[client.room].getPowerDuring(client.name, powerTmp);
    delete games[client.room].items[item.id];
  });

  client.on('logout',     function ()           {
    if (token)
      delete playersToken[token];
  });
});
