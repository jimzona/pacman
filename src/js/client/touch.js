//****************************************************//
//*                Gestion mouvements                *//
//*                   1 - clavier                    *//
//****************************************************//

document.addEventListener("keydown", function (evt) {
  switch (evt.keyCode) {
    case 83: case 40:
      player.wantDirection = 4; break;           // down
    case 90: case 38:
      player.wantDirection = 2; break;             // up
    case 81: case 37:
      player.wantDirection = 3; break;           // left
    case 68: case 39:
      player.wantDirection = 1; break;          // right
  }
}, false);

document.addEventListener('keyup', function () {}, false);

//****************************************************//
//*                Gestion mouvements                *//
//*               2 - surface tactile                *//
//****************************************************//
//*https://stackoverflow.com/questions/2264072/detect-a-finger-swipe-through-javascript-on-the-iphone-and-android/23230280#23230280

var xStart, yStart;

document.addEventListener('touchstart', function (evt) {
  xStart = evt.touches[0].clientX;
  yStart = evt.touches[0].clientY;
}, false);

document.addEventListener('touchmove', function (evt) {
  if ( !xStart || !yStart ) return;

  var xEnd = evt.touches[0].clientX;
  var yEnd = evt.touches[0].clientY;

  var xLen = xStart - xEnd;   // taille déplacement en x
  var yLen = yStart - yEnd;   // taille déplacement en y

  if (Math.abs(xLen) > Math.abs(yLen)) { // plus grd déplacement en x
    if (xLen > 0) player.wantDirection = 3;      // left
    else          player.wantDirection = 1;     // right
  }
  else {                               // plus grd déplacement en y
    if (yLen > 0) player.wantDirection = 2;        // up
    else          player.wantDirection = 4;      // down
  }
  xStart = null;
  yStart = null;
}, false);
