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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CG' });
});

/*Une autre manière de faire : diviser en plusieurs fichiers*/

var db = require("./DBquery");
router.post("/add/:type/", db.add);//Switch to add anything in db
router.post("/get/:type/", db.get);//Switch to get anything from db
router.post("/remove/:type/", db.remove);//Switch to remove anything from db
router.post("/modify/:type/", db.modify);//Switch to modify anything from db
router.post("/complex/:type/", db.complex);//Switch to request anything complex from db

router.post('/newsession', function(req, res){
    sess = req.session;
    sess.data = req.body.data;
    console.log(sess);
    res.render('magasin', {session: sess});
});

router.post('/getsession', function(req, res){
    sess = req.session;
    console.log(sess)
    if(sess.data) res.send(sess.data);
});

module.exports = router;
