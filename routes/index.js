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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CG' });
});

router.post('/magasins', function(req, res){
  connection.query('SELECT Magasin.idMagasin, Magasin.Nom FROM Magasin', function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});

router.post('/commandes', function(req, res){
  var query = "SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, "+
  "Commande.PNP, Commande.Remarque, Client.Nom AS clientNom, Vendeuse.Nom AS vendeuseNom, Magasin.Nom AS magasinNom "+
  "FROM Commande "+
  "JOIN Terminal ON Commande.Terminal_idTerminal=idTerminal "+
  "JOIN Client ON Commande.Client_idClient=Client.idClient "+
  "JOIN Vendeuse ON Commande.Vendeuse_idVendeuse=Vendeuse.idVendeuse "+
  "JOIN Magasin ON Terminal.Magasin_idMagasin=Magasin.idMagasin "+
  "WHERE (FALSE ";
  var isMagSelect = false;
  for(var key in req.body.selectedMagasins){
    if(req.body.selectedMagasins[key]){
      query = query+" OR Terminal.Magasin_idMagasin=" + key;
      isMagSelect = true;
    }
  }
  if(!isMagSelect) query = query + 'OR TRUE';
  query = query + ")";
  if(req.body.dateCreate) query = query + " AND Commande.Creation LIKE '" + req.body.dateCreate + "%'";
  if(req.body.dateLivraison) query = query + " AND Commande.Livraison LIKE '" + req.body.dateLivraison + "%'";
  query = query + " ORDER BY Commande.Creation DESC LIMIT 0," + (req.body.nbrResult?req.body.nbrResult:"20");

  console.log(query);

  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});

router.post('/clients', function(req, res){
  var query = "SELECT * FROM Client WHERE Client.Nom LIKE '%" + req.body.nom + "%';";

  connection.query(query, function(err, rows, fields) {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
  });
});

router.post('/categories', function(req, res){
  if(!req.body.nom){
    connection.query('SELECT * FROM Categorie', function(err, rows, fields) {
      if (err) throw err;
      res.send(rows);
    });
  } else {
    connection.query("SELECT * FROM Categorie WHERE Categorie.Nom LIKE '%"+req.body.nom+"%'", function(err, rows, fields) {
      if (err) throw err;
      res.send(rows);
    });
  }
});

router.post('/produits', function(req, res){
  var query = 'SELECT Produit.idProduit, Produit.Nom, Produit.Prix, Categorie.Nom AS nomCategory, Categorie.idCategorie AS idCategory ' +
      'FROM Produit JOIN Categorie ON Produit.Categorie_idCategorie=Categorie.idCategorie ' +
      "WHERE (FALSE ";
  for(var key in req.body.selectedCategories){
    if(req.body.selectedCategories[key]) query = query+" OR Categorie.idCategorie=" + key;
  }
  query = query + (req.body.nom?(") Produit.Nom LIKE '%" + req.body.nom + "%';"):");");

  connection.query(query , function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});

router.post("/newCategory", function(req, res){
  var query = "INSERT INTO Categorie(Nom) VALUES('"+req.body.nom+"');";

  connection.query(query , function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});
module.exports = router;
