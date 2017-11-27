
//****************************************************//
//*                     Required                     *//
//****************************************************//
require('./config');
express      = require('express');
bcrypt       = require('bcrypt');
uuidv4       = require('uuid/v4');
app          = express();
server       = require('http').Server(app);
io           = require('socket.io')(server);
bdd          = require('./bdd');
maps         = require('./Map');
Maps         = require('../share/Map');
item         = require('./Item');
Ghost        = require('./Ghost');
Game         = require('./Game');
f            = require('./function');

//****************************************************//
//*             Initialisations Globales             *//
//****************************************************//
playersToken = {};
games        = {};
