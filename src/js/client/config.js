/**   variables globales initialisé ds 'initGame'    **/
var WIDTH_MAX, HEIGHT_MAX, size, room;

/**      variables globales actualisé par le jeu     **/
var player, items = {}, ghosts = {}, other = {}, mapcell = 0;

/**          elements du DOM qu'on modifie           **/
var canvas = document.getElementById('game');
var share  = document.getElementById('share');
var join   = document.getElementById('join');
var score  = document.getElementById('score');
var life   = document.getElementById('life');
var logout = document.getElementById('logout');

//**    si qqn copy/colle le lien vers la partie    **//
var url = window.location.href.split('#');
if (url.length > 1 && url[1]) {
   room = url[1];
   share.value = window.location.host + '/#' + room;
}
//**               connection serveur               **//
var socket = io.connect('/', { query: 'room='+room });

/**                 gestion du canva                 **/
var ctx    = canvas.getContext("2d");
ctx.font  = '15px Arial';
ctx.canvas.width  = window.innerWidth;
ctx.canvas.height = window.innerHeight;
var WIDTH  = canvas.width;
var HEIGHT = canvas.height;

window.onresize = function() {                          // si change résolution écran
  ctx.canvas.width  = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  WIDTH  = canvas.width;
  HEIGHT = canvas.height;
}

//**            initialisation des images           **//
var Img = {};
Img.map     = newImg("map");
Img.player  = newImg("pacman");
Img.clyde   = newImg("clyde");
Img.pinky   = newImg("pinky");
Img.ghostWB = newImg("ghostWB");
Img.items   = newImg("items");

//**         ui avec une couleur aléatoire          **//
var colors = ["#45cccc", "#e7db63", "#9370ab", "#ed0a04", "#236dbf", "#c55994", "#13c97d", "#4f35d8"];
var color  = colors[Math.floor(Math.random() * colors.length)];

//**         change la couleur de la grille         **//
Img.map.onload = function () {
  Img.map = changeColor(getPixels(Img.map), hexToRGB(color));
};

//**  change la couleur de la fenêtre de connection **//
var styleEl = document.createElement('style'), styleSheet;
document.head.appendChild(styleEl);                     // nouvelle feuille de style
styleSheet = styleEl.sheet;
styleSheet.insertRule('.form-box label::after, .form-box .message a'
  + ' { color:'+ color +'; }',                          // couleur
  styleSheet.cssRules.length);
styleSheet.insertRule('button'                          // dégradé
  + ' { background: linear-gradient(18deg, #ffcc00,'+ color +'); }',
  styleSheet.cssRules.length);

//**                 event listener                 **//
// login
document.login.submit.addEventListener("click", function() {
  socket.emit('login', {pseudo: document.login.pseudo.value,
                        pass  : document.login.pass.value,
                        stay  : document.login.stay.checked});
});
// login as guest
document.guest.submit.addEventListener("click", function() {
  socket.emit('guest');
});
// register
document.register.submit.addEventListener("click", function() {
  socket.emit('register', {pseudo: document.register.pseudo.value,
                           pass  : document.register.pass.value,
                           email : document.register.email.value});
});
// play
document.play.submit.addEventListener("click", function() {
  socket.emit('login');
});
// logout
logout.addEventListener("click", function() {
  document.cookie = 'id=;expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  socket.emit('logout');
  location.reload(true);
});
