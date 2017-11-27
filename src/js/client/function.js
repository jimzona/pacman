//**              actualisation du jeu              **//
function gameUpdate(){
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  mapcell.draw();
  for (var key in items)  items[key].update();
  for (var key in other)  other[key].update();
  for (var key in ghosts) ghosts[key].update();
  player.update();
}

//**              actualisation du hud              **//
function hudUpdate() {
  playerInfo();
  bestScore();
}

//**           demande à changer de salle           **//
function changeRoom() {
  if (join.value.indexOf('#') > 0)
    join.value = join.value.split('#')[1];
  socket.emit('changeRoom', join.value);
}

//**  copier la salle courante ds le presse-papier  **//
function copyRoom() {
  share.select();
  document.execCommand('copy');
}

//**            creer une nouvelle image            **//
function newImg(name, ext='.png', path='images/') {
  var img = new Image();
  img.src = path + name + ext;
  return img;
}

//**     recupere tableau de valeur d'une image     **//
function getPixels(img) {
    var canvas = document.createElement("canvas");      // creer un canva vide
    var c = canvas.getContext("2d");
    c.canvas.width  = img.width  || img.naturalWidth;
    c.canvas.height = img.height || img.naturalHeight;
    c.drawImage(img, 0, 0);                             // dessine l'img ds le canvas

    return c.getImageData(0, 0, img.width, img.height);
}

//**    convertie un code couleur hexa vers rgb     **//
function hexToRGB(hex) {
    var long = parseInt(hex.replace(/^#/, ""), 16);
    return {
        R: (long >>> 16) & 0xff,
        G: (long >>> 8) & 0xff,
        B: long & 0xff
    };
}

//**         changer la couleur d'une image         **//
function changeColor(img, color) {
  var canvas = document.createElement('canvas');
  var c = canvas.getContext('2d');
  c.canvas.width  = img.width;
  c.canvas.height = img.height;
  for(var I = 0, L = img.data.length; I < L; I += 4) {
    if(img.data[I + 3] > 0) {    // pixel non tranparent
      img.data[I] = color.R;
      img.data[I + 1] = color.G;
      img.data[I + 2] = color.B;
    }
  }
  c.putImageData(img, 0, 0);
  var image = new Image();
  image.src = canvas.toDataURL();
  return image;
}

//**         affichage de la vie du joueur          **//
function playerInfo () {
  var lifeDisp = life.childElementCount;
  if (lifeDisp < player.life) {
    for (lifeDisp; lifeDisp != player.life; lifeDisp++) {
      var aLife = new Image();
      aLife.src = 'images/pacman-1.png';
      life.appendChild(aLife);
    }
  }
  if (lifeDisp > player.life) {
    for (lifeDisp; lifeDisp != player.life; lifeDisp--)
      life.removeChild(life.firstChild);
  }
}

//**            affichage des x er score            **//
function bestScore() {
  var scores = [{n: player.name, s: player.score, local: 1}]; // score du joueur
  for (var name in other)
    scores.push({n: name, s: other[name].score});       // score des autres joueurs
  scores.sort((a, b) => b.s - a.s);                     // trier par ordre décroissant

  var playerIn = false;
  var html = [];
  for (var i = 0; i < 10; i++) {
    if (i < scores.length) {
      if (scores[i].local) {
        playerIn = true;
        html.push('<span style="color:red">'
          + (i+1) + '.' + scores[i].n +' - '+ scores[i].s + '</span>');
      }
      else html.push('<span>' + (i+1) + '.' + scores[i].n
          + ' - '+ scores[i].s + '</span>');
    }
  }
  if (!playerIn) {                                      // pas déjà afficher score du joueur
    var n = scores.findIndex(o => o.local);
    html.push('<span>' + (n+1) + '.' + player.name
      + ' - '+  player.scor + '</span>');
  }
  score.innerHTML = html.join('');
}

//**                fadeOut / fadeIn                **//
//http://www.chrisbuttery.com/articles/fade-in-fade-out-with-javascript/
function fadeOut(el) {
  el.style.opacity = 1;
  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = "none";
    } else {
      requestAnimationFrame(fade);
    }
  })();
}

function fadeIn(el, display) {
  el.style.opacity = 0;
  el.style.display = display || "block";
  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    }
  })();
}

//**      bascule entre connection/inscription      **//
function toggle(on) {
  if (on) fadeOut(document.register);
  else fadeIn(document.register);
  document.getElementsByClassName('error')[0].innerHTML = "";
}

//**             cache écran connection             **//
function hideCon() {
  fadeOut(document.getElementsByClassName('form-box')[0]);
  fadeOut(document.getElementsByClassName('party')[0]);
  document.getElementById('game').style.filter = 'blur(0)'; // enléve flou au jeu
  document.getElementsByClassName('hud')[0].style.display = 'block';
}
