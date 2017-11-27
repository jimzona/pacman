//****************************************************//
//*                  Variables                       *//
//****************************************************//
/*          ~ port sur le quel ouvrir l'app ~         */
gameport    = 8080;
/*                     ~ verbose ~                    */
v           = true;
/*                ~ verbose renforcé ~                */
vv          = false;
/*               ~ taille de la carte ~               */
mapSize     = 50;
/*             ~ nombre de superpacgomme ~            */
maxSuper    = 4;
/*                 ~ nombre de Clyde ~                */
maxClyde    = 2;
/*                 ~ nombre de Pink ~                 */
maxPink     = 2;
/*             ~ nombre de vie intiale ~              */
life        = 1;
/*           ~ durée d'une superpacgomme ~            */
powerTmp    = 8000;
/*         ~ taille d'une case de la grille ~         */
mapCellW    = 30;
/*    ~ rayon d'alerte joueur sous superpacgomme ~    */
radiusAlert = 20;
/*          ~ temps minimal entre 2 bonus ~           */
bonusTmpMin = 50;
/*          ~ temps maximal entre 2 bonus ~           */
bonusTmpMax = 3000;
/*          ~ vitesse de la boucle de jeu  ~          */
loopSpd     = 60;
/*       ~ maximum de joueurs dans une salle  ~       */
maxPlayers  = 5;
/*        ~ nbr de tours pr cryptage des mdp ~        */
saltRnds    = 10;
/*       ~ temps de vie des cookies j*h*mn*s*ms~      */
cookieTime  = 1 * 1 * 60 * 60 * 1000;
/*                 ~ connection bdd ~                 */
host        = "localhost";
port        = 3306;
user        = "root";
password    = "";
database    = "main";
