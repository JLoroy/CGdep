var express = require('express');
var router = express.Router();

var mysql = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'admin',
  database : 'cgdb',
  port     : '3306'
});
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'CG' });
});

router.post('/magasins', function(req, res){
  if(!req.body.nom){
    connection.query('SELECT * FROM Magasin', function(err, rows, fields) {
      if (err) throw err;
      res.send(rows);
    });
  } else {
    connection.query("SELECT * FROM Magasin WHERE Magasin.Nom LIKE '%"+req.body.nom+"%'", function(err, rows, fields) {
      if (err) throw err;
      res.send(rows);
    });
  }
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

router.post('/vendeuses', function(req, res){
    if(!req.body.nom){
        connection.query('SELECT * FROM Vendeuse', function(err, rows, fields) {
            if (err) throw err;
            res.send(rows);
        });
    } else {
        connection.query("SELECT * FROM Vendeuse WHERE Vendeuse.Nom LIKE '%"+req.body.nom+"%'", function(err, rows, fields) {
            if (err) throw err;
            res.send(rows);
        });
    }
});

router.post('/terminals', function(req, res){var query = "SELECT Terminal.idTerminal, Terminal.Actif, Magasin.Nom as magasin " +
    "FROM Terminal "+
    "JOIN Magasin ON Terminal.Magasin_idMagasin = Magasin.idMagasin "+
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

    console.log(query);

    connection.query(query, function(err, rows, fields) {
        if (err) throw err;
        console.log(rows);
        res.send(rows);
    });
});

router.post('/feries', function(req, res){
    var query = "SELECT * FROM Ferie ORDER BY Ferie.date;";

    connection.query(query, function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
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

router.post("/newMagasin", function(req, res){
  var query = "INSERT INTO Magasin(Nom, Adresse) VALUES('"+req.body.nom+"','"+req.body.adresse+"');";
    console.log(query);
  connection.query(query , function(err, rows, fields) {
    if (err) throw err;
    res.send(rows);
  });
});

router.post("/newVendeuse", function(req, res){
    //TODO : photo
    var query = "INSERT INTO Vendeuse(Nom) VALUES('"+req.body.nom+"');";

    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});

router.post("/newTerminal", function(req, res){
    var query = "INSERT INTO Terminal(Terminal.Magasin_idMagasin, Terminal.Actif) VALUES("+req.body.magasin+",1);";
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
    console.log(query);
});

router.post("/newFerie", function(req, res){
    //date must be "yyyy:mm:dd"
    var query = "INSERT INTO Ferie(date) VALUES('"+req.body.date+"');";
    console.log(query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});

//Switch to remove anything from db
router.post("/remove/:type/", function(req,res){
    var rem = req.body.toRemove
    var query = "";
    console.log("Removing : ");
    console.log(rem);
    switch(req.params.type) {
        case "terminal":
            query = "UPDATE Terminal SET Actif = 0 WHERE idTerminal = '"+rem.idTerminal+"';";
            break;
        case "ferie":
            query = "DELETE FROM Ferie WHERE Ferie.idFerie = "+rem.idFerie+";";
            break;
        default:
            console.log("Supression d'un type inconnu : "+req.params.type);
    }
    console.log(query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});

//Switch to modify anything from db
router.post("/modify/:type/", function(req,res){
    var query = "";
    var mod = req.body.toModify;
    switch(req.params.type) {
        case "terminal":
            query = "UPDATE terminal SET Magasin_idMagasin = '"+mod.idMagasin+"' WHERE idTerminal = '"+mod.idTerminal+"';";
            break;
        default:
            console.log("Supression d'un type inconnu : "+req.params.type);
    };
    console.log(query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
});
module.exports = router;
