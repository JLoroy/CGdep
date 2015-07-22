var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'eu1Thi4iawie',
    database : 'cgdb',
    port     : '3306'
});
connection.connect();

function select_query(choices, column){
    query = "(FALSE ";
    var isSelect = false;
    for(var key in choices){
        if(choices[key]) query = query+" OR "+column+"=" + key;
        isSelect = true;
    }
    return query + (isSelect?")":"OR TRUE)");
}

exports.get = function(req, res){
    var query = "";
    var params = req.body.params;
    switch(req.params.type){
        case "commande":
            query = "SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, "+
            "Commande.PNP, Commande.Remarque, Client.Nom AS clientNom, Vendeuse.Nom AS vendeuseNom, Magasin.Nom AS magasinNom "+
            "FROM Commande "+
            "JOIN Terminal ON Commande.Terminal_idTerminal=idTerminal "+
            "JOIN Client ON Commande.Client_idClient=Client.idClient "+
            "JOIN Vendeuse ON Commande.Vendeuse_idVendeuse=Vendeuse.idVendeuse "+
            "JOIN Magasin ON Terminal.Magasin_idMagasin=Magasin.idMagasin "+
            "WHERE "+select_query(params.selectedMagasins,"Terminal.Magasin_idMagasin");
            if(params.dateCreate) query = query + " AND Commande.Creation LIKE '" + params.dateCreate + "%'";
            if(params.dateLivraison) query = query + " AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
            query = query + " ORDER BY Commande.Creation DESC LIMIT 0," + (params.nbrResult?params.nbrResult:"20");
            break;
        case "produit":
            query = "SELECT * FROM Produit WHERE ";
            query = query + (params.Nom?("Produit.Nom LIKE '%" + params.Nom + "%' AND "):"") + select_query(params.selectedCategories, "Produit.Categorie_idCategorie") +";";
            break;
        case "client":
            query = "SELECT * FROM Client WHERE Client.Nom LIKE '%" + params.Nom + "%';";
            break;
        case "category":
            query = "SELECT * FROM Categorie;";
            break;
        case "magasin":
            query = "SELECT * FROM Magasin;";
            break;
        case "vendeuse":
            query = "SELECT * FROM Vendeuse WHERE " + (params.Nom?"Vendeuse.Nom LIKE '%" + params.Nom + "%' ":"")+select_query(params.selectedMagasins,"Vendeuse.Magasin_idMagasin");
            break;
        case "custom":
            query = "SELECT * FROM ProduitCustom WHERE";
            query = query + (params.Nom?("ProduitCustom.Nom LIKE '%" + params.Nom + "%' AND "):"") + select_query(params.selectedCategories, "ProduitCustom.Categorie_idCategorie") +";";
            break;
        case "terminal":
            query = "SELECT * FROM Terminal;";
            break;
        case "ferie":
            query = "SELECT * FROM Ferie;";
            break;
        default:
            console.log("Requete d'un type inconnu : "+req.params.type);
    }
    console.log("get : "+query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
};

exports.add = function(req, res){
    var x = req.body.new;
    var query = "";
    switch(req.params.type) {
        case "category":
            query = "INSERT INTO Categorie(Nom) VALUES('"+x.nom+"');";
            break;
        case "produit":
            query = "INSERT INTO Produit(Nom, Prix, Categorie_idCategorie) VALUES('"+x.Nom+"',"+x.Prix+","+x.Categorie_idCategorie+");";
            break;
        case "magasin":
            query = "INSERT INTO Magasin(Nom, Adresse) VALUES('"+x.Nom+"','"+x.Adresse+"');";
            break;
        case "vendeuse":
            query = "INSERT INTO Vendeuse(Nom, Magasin_idMagasin) VALUES('"+x.nom+"',"+x.magasin+");";
            break;
        case "terminal":
            query = "INSERT INTO Terminal(Magasin_idMagasin) VALUES("+x.Magasin_idMagasin+");";
            break;
        case "custom":
            query = "INSERT INTO ProduitCustom(Nom, Prix, Categorie_idCategorie) VALUES("+x.nom+","+x.prix+","+x.categorie+");";
            break;
        case "ferie":
            query =  "INSERT INTO Ferie(date) VALUES('"+x.date+"');";
            break;
        default:
            console.log("Rajout d'un type inconnu : "+req.params.type);
    }
    console.log("add : "+query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
};

exports.remove = function(req, res){
    var rem = req.body.toRemove;
    var query = "";
    switch(req.params.type) {
        case "client":
            query = "UPDATE Client SET display = 0 WHERE idClient = '"+rem.idClient+"';";
            break;
        case "category":
            query = "UPDATE Categorie SET display = 0 WHERE idCategorie = '"+rem.idCategorie+"';";
            break;
        case "produit":
            query = "UPDATE Produit SET display = 0 WHERE idProduit = '"+rem.idProduit+"';";
            break;
        case "magasin":
            query = "UPDATE Magasin SET display = 0 WHERE idMagasin = '"+rem.idMagasin+"';";
            break;
        case "custom":
            query = "UPDATE produitcustom SET display = 0 WHERE idProduitCustom = '"+rem.idProduitCustom+"';";
            break;
        case "vendeuse":
            query = "UPDATE vendeuse SET display = 0 WHERE idVendeuse = '"+rem.idVendeuse+"';";
            break;
        case "terminal":
            query = "UPDATE Terminal SET Actif = 0 WHERE idTerminal = '"+rem.idTerminal+"';";
            break;
        case "ferie":
            query = "DELETE FROM Ferie WHERE Ferie.idFerie = "+rem.idFerie+";";
            break;
        default:
            console.log("Supression d'un type inconnu : "+req.params.type);
    }
    console.log("delete : "+query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
};

exports.modify = function(req, res){
    var query = "";
    var mod = req.body.toModify;
    switch(req.params.type) {
        case "produit":
            query = "UPDATE Produit SET Nom = '"+mod.Nom+"', Prix = "+mod.Prix+", Categorie_idCategorie = "+mod.Categorie_idCategorie+" WHERE idProduit = '"+mod.idProduit+"';";
            break;
        case "client":
            query = "UPDATE Client SET Nom = '"+mod.Nom+"', Tel = "+mod.Tel+", Mail = "+mod.Mail+", TVA = "+mod.TVA+" WHERE idClient = '"+mod.idClient+"';";
            break;
        case "category":
            query = "UPDATE Categorie SET Nom = '"+mod.Nom+"' WHERE idCategorie = '"+mod.idCategorie+"';";
            break;
        case "magasin":
            query = "UPDATE Magasin SET Nom = '"+mod.Nom+"', Adresse = '"+mod.Adresse+"' WHERE idMagasin = '"+mod.idMagasin+"';";
            break;
        case "vendeuse":
            query = "UPDATE vendeuse SET Nom = '"+mod.Nom+"', Magasin_idMagasin = "+mod.Magasin_idMagasin+" WHERE idVendeuse = '"+mod.idVendeuse+"';";
            break;
        case "custom":
            query = "UPDATE produitcustom SET Nom = '"+mod.Nom+"', Prix = '"+mod.Prix+"', Categorie_idCategorie = "+mod.categorie+" WHERE idProduitCustom = '"+mod.idProduitCustom+"';";
            break;
        case "terminal":
            query = "UPDATE terminal SET Magasin_idMagasin = '"+mod.Magasin_idMagasin+"' WHERE idTerminal = '"+mod.idTerminal+"';";
            break;
        default:
            console.log("Supression d'un type inconnu : "+req.params.type);
    }
    console.log("modify : "+query);
    connection.query(query , function(err, rows, fields) {
        if (err) throw err;
        res.send(rows);
    });
};