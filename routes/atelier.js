var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  sess = req.session;

  if(sess.data){
    res.render('atelier', {session: sess.data});
  } else {
    res.render('atelier', {});
  }
});

module.exports = router;
