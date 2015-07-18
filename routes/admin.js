var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'eu1Thi4iawie',
  database : 'cgdb',
  port     : '3306'
});
connection.connect();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('admin', {});
});

module.exports = router;
