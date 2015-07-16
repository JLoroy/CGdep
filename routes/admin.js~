var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'admin',
  database : 'CGdb',
  port     : '3306'
});
connection.connect();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin', {});
});

router.get('/data', function(req, res){
  connection.query('SELECT * FROM client', function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});

module.exports = router;
