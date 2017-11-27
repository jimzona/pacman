var mysql    = require('mysql');
var con      = mysql.createConnection({       // connection bdd
  host: 'localhost',
  //port: port,
  user: 'root',
  password: 'dijon92'
});

con.query('CREATE DATABASE IF NOT EXISTS ' + database, function (err) {
    if (err) {
      if (err.code == 'ECONNREFUSED') {
        console.log("Server connection error");
        process.exit(1)
      } else throw err;
    }
    con.query('USE main', function (err) {    // utiliser la bdd 'main'
        if (err) throw err;
        con.query('CREATE TABLE IF NOT EXISTS users('
            + 'pseudo VARCHAR(30) NOT NULL,'
            + 'PRIMARY KEY(pseudo),'
            + 'pass   VARCHAR(30)  NOT NULL,'
            + 'email  VARCHAR(255) NOT NULL'
            +  ')', function (err) {
                if (err) throw err;
        });
        con.query('CREATE TABLE IF NOT EXISTS scores('
            + 'id MEDIUMINT NOT NULL AUTO_INCREMENT,'
            + 'PRIMARY KEY(id),'
            + 'pseudo VARCHAR(30) NOT NULL,'
            + 'score BIGINT UNSIGNED NOT NULL'
            +  ')', function (err) {
              if (err) throw err;
        });
    });
});

exports.con = con;

exports.saveScore = function (name, score) {
  if (!score) return;
  var data = {pseudo: name, score: score};
  bdd.con.query('INSERT INTO scores SET ?', data, function (err, result) {
    if (err) throw err;
    if (v) console.log(name, 'score:', score);
  });
}

exports.getScores = function (name, callback) {
  if (!name) return;
  var query = bdd.con.query("SELECT MAX(score) as best, \
    SUBSTRING_INDEX(GROUP_CONCAT(score ORDER BY id DESC), ',', 1) as last \
    FROM scores WHERE pseudo = ? ", name, function (err, result) {
    if (err) throw err;
    var r = {best: result[0].best, last: result[0].last};
    if (callback) callback(r)
    else return r;
  });
}
