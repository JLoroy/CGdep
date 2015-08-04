var mysql = require('mysql');
var connection = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : 'eu1Thi4iawie',
    database : 'cgdb',
    port     : '3306'
});
connection.connect();

var fs = require('fs');
var util = require('util');
var now = (new Date()).getTime();
var log_file = fs.createWriteStream("logs/"+now+'debug.log', {flags : 'w'});
var debug = function(m){
    console.log(m);
    log_file.write(util.format(m) + '\n');
}

var newEntryAtelier = function(produit, Produits, isCustom){
    var idP = "idProduit" + (isCustom?"Custom":"");
    var id = produit[idP].toString()+(isCustom?"C":"P");
    if(!Produits[id]) {
        Produits[id] = {
            isCustom: false,
            id: produit[idP],
            Nom: produit.Nom,
            Total: 0,
            Categorie: produit.Categorie_idCategorie,
            Magasin: {},
            Details: []
        };
    }
    Produits[id].Total = Produits[id].Total+produit.Quantite;
    if(!Produits[id].Magasin[produit.Magasin_idMagasin]){
        Produits[id].Magasin[produit.Magasin_idMagasin] = {Total: 0};
    }
    Produits[id].Magasin[produit.Magasin_idMagasin].Total = Produits[id].Magasin[produit.Magasin_idMagasin].Total+produit.Quantite;
    if(!produit.Details == ''){
        Produits[id].Details.push({
            Quantite: produit.Quantite,
            Magasin: produit.MagasinNom,
            Detail: produit.Details
        });
    }
    return Produits;
};

var refactorProduitCommande = function(produits, customs){
    var result = {};
    for(produit in produits){
        result = newEntryAtelier(produits[produit], result, false);
    }
    for(produit in customs){
        result = newEntryAtelier(customs[produit], result, true);
    }
    return result;
};

function newMots(params){
    //any description has new words ? motcuston(idMotCustom, Mot)
    //get all words in a dico {mot:mot}
    var oldMots = {};
    var newMots = {};
    var query_oldMots = "SELECT * FROM motcustom;"
    var thereAreNewWords = false;
    connection.query(query_oldMots , function(err, rows, fields) {
        if (err) throw err;
        for(var i = 0; i < rows.length; i++){
            var mot = rows[i].Mot;
            oldMots[mot]=mot;
        }
        for(var indice = 0; indice < params.produits.length; indice++){
            //new word?
            var p = params.produits[indice];
            p.commentaire.split(' ').some(function(mot){
                //si le mot n'est pas d�j� dans le dico, le rajouter
                if(!(oldMots[mot]) && mot!=''){
                    newMots[mot]=mot;
                    thereAreNewWords = true;
                }
            })
        }
        //pour la remarque g�n�rale aussi :
        params.Remarque.split(' ').some(function(mot){
            //si le mot n'est pas d�j� dans le dico, le rajouter
            if(!(oldMots[mot])&& mot!=''){
                newMots[mot]=mot;
            }
        })
        //rajouter les mots custom
        var query_insert_mots = "INSERT INTO motcustom(Mot) VALUES ";
        var firstMot = true;
        for (var m in newMots){
            query_insert_mots += firstMot?   ""   :",";firstMot = false;
            query_insert_mots += " ('"+newMots[m]+"')";
        }
        query_insert_mots += ";"
        if(thereAreNewWords) {
            debug("number of new words :"+Object.keys(newMots).length);
            debug(query_insert_mots);
            connection.query(query_insert_mots, function (err, rows, fields) {
                if (err) throw err;
            });
        }
    });
}
function com_client(params, idTerminal){
    // Client ( idClient, Inscription, Mail, Tel, Nom, TVA, display)
    var Client_idClient = 1;

    //1) on check si le client existe d�j� (sur base du num�ro de tel)
    var query_client = "SELECT * FROM Client WHERE Nom='"+params.client.Nom+"';";
    connection.query(query_client , function(err, rows, fields) {
        if (err) throw err;
        if (rows.length > 0){

            //2) si il existe, on garde son idClient (et on l'update)
            Client_idClient = rows[0].idClient;
            var query_update_client = "UPDATE Client SET Tel='"+params.client.Tel +"', Mail = '"+params.client.Mail +"', Nom = '"+params.client.Nom +"', TVA = '"+params.client.TVA +"' WHERE idClient = '"+Client_idClient +"';"
            debug(query_update_client);
            connection.query(query_update_client , function(err, rows, fields) {if (err) throw err;});
            com_commande(params, idTerminal, Client_idClient);
        }
        else{
            //3) sinon, on le cr�e
            /*                    var query_insert_client = "INSERT INTO Client(Inscription, Mail, Tel, Nom, TVA) VALUES ('"+ connection.escape(new Date())+"','"+params.client.Mail+"','"+params.client.Tel+"','"+params.client.Nom+"','"+params.client.TVA+"');";
             debug(query_insert_client);
             connection.query(query_insert_client , function(err, rows, fields) {if (err) throw err;});*/
            connection.query('INSERT INTO Client SET ?', {
                Inscription: new Date(),
                Nom:params.client.Nom,
                Mail:params.client.Mail,
                Tel:params.client.Tel,
                TVA:params.client.TVA
            }, function(err, result) {
                if (err) throw err;
                Client_idClient = rows.insertId;
                debug("clientID :"+result.insertId);
                com_commande(params, idTerminal, Client_idClient);
            });


        }
    });
}
function com_commande(params, Terminal_idTerminal, Client_idClient){
    // Commande ( idCommande, Creation, Livraison, Montant, PNP, Remarque, Client_idClient, Vendeuse_idVendeuse, Terminal_idTerminal, display)
    console.log(params);
    //todo gerer la date
    var Livraison = params.Livraison;
    debug(Livraison);
    //IF modify Command
    if(params.idCommande){
        var query_delete_produitsCommandes = "DELETE FROM ProduitCommande WHERE Commande_idCommande = "+params.idCommande+";";
        var query_update_commande = "UPDATE Commande SET " +
            "Livraison = '"+Livraison+"',"+
            "Montant = "+params.Montant+","+
            "PNP = '"+params.PNP+"',"+
            "Remarque = '"+params.Remarque+"',"+
            "Client_idClient = '"+Client_idClient+"',"+
            "Vendeuse.idVendeuse = '"+params.vendeuse.idVendeuse+"',"+
            "Terminal.idTerminal = '"+Terminal_idTerminal+"';"
        //les deux d'un coup, oui oui
        debug(query_delete_produitsCommandes+query_update_commande);
        connection.query(query_delete_produitsCommandes+query_update_commande , function(err, rows, fields) {
            if (err) throw err;
            com_produitcommandes(params);
        });
    }
    //ELSE new Command
    else{
        var Creation = connection.escape(new Date());
        var query_insert_commande = "INSERT INTO Commande( Creation, Livraison, Montant, PNP, Remarque, Client_idClient, Vendeuse_idVendeuse, Terminal_idTerminal) VALUES ("+
            ""+Creation+","+"'"+Livraison+"',"+"'"+params.montant+"',"+"'"+params.PNP+"',"+"'"+params.Remarque+"',"+
            "'"+Client_idClient+"',"+"'"+params.vendeuse.idVendeuse+"',"+"'"+Terminal_idTerminal+"');"
        debug(query_insert_commande);
        connection.query(query_insert_commande , function(err, rows, fields) {
            if (err) throw err;
            params.idCommande = rows.insertId;
            com_produitcommandes(params);
        });

    }
}
function com_produitcommandes(params){
    var firstProduitCommande = true;
    var numberProdCustom = 0;
    var numberProd = 0;
    //new Produit commandes
    //produitcommande(idProduitCommande, Quantite, Details, Commande_idCommande, Produit_idProduit, Custom, ProduitCustom_idProduitCustom)
    var query_insert_produitCommande = "INSERT INTO produitcommande(Quantite, Details, Commande_idCommande, Produit_idProduit, Custom) VALUES ";
    for(var indice = 0; indice < params.produits.length; indice ++){
        var p = params.produits[indice];
        //si il est custom, on le rajoute et on indique son id
        if(p.prod.custom){
            //todo check if il existe deja (dans le cas d'une modification de commande)
            if(!p.prod.idProduitCustom) {
                var query_insert_produitCustom = "INSERT INTO produitcustom(Nom, Prix, Categorie_idCategorie) VALUES ('" + p.prod.Nom + "'," + 1 + "," + p.prod.Categorie_idCategorie + ");";
                debug(query_insert_produitCustom);
                connection.query(query_insert_produitCustom, function (err, rows, fields) {
                    if (err) throw err;
                    p.prod.idProduitCustom = rows.insertId;
                    debug("produit custom numero "+ p.prod.idProduitCustom);
                    connection.query("INSERT INTO produitcommande SET ?",{
                        Quantite: p.qty,
                        Details: p.commentaire,
                        Commande_idCommande: params.idCommande,
                        ProduitCustom_idProduitCustom: p.prod.idProduitCustom,
                        Custom:0
                    }, function(err,rows,fields){
                        if (err) throw err;
                        debug(p.prod.Nom+" ajout�");
                    })
                });
            }
        }
        else{
            //Query normale
            query_insert_produitCommande += firstProduitCommande?   ""    :",";firstProduitCommande = false;
            query_insert_produitCommande += " ("+p.qty+",'"+p.commentaire+"',"+params.idCommande+","+p.prod.idProduit+",0)";
            numberProd++;
        }
    }
    query_insert_produitCommande += ";";
    debug(query_insert_produitCommande);
    if(numberProd>0){
        connection.query(query_insert_produitCommande , function(err, rows, fields) {if (err) throw err;});
    }
}

function select_query(choices, column){
    query = "(FALSE ";
    var isSelect = false;
    for(var key in choices){
        if(choices[key]) {
            query = query+" OR "+column+"=" + key;
            isSelect = true;
        }
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
            query = "INSERT INTO Categorie(Nom) VALUES('"+x.Nom+"');";
            break;
        case "produit":
            query = "INSERT INTO Produit(Nom, Prix, Categorie_idCategorie) VALUES('"+x.Nom+"',"+x.Prix+","+x.Categorie_idCategorie+");";
            break;
        case "magasin":
            query = "INSERT INTO Magasin(Nom, Adresse) VALUES('"+x.Nom+"','"+x.Adresse+"');";
            break;
        case "vendeuse":
            query = "INSERT INTO Vendeuse(Nom, Magasin_idMagasin) VALUES('"+x.Nom+"',"+x.Magasin_idMagasin+");";
            break;
        case "terminal":
            query = "INSERT INTO Terminal(Magasin_idMagasin) VALUES("+x.Magasin_idMagasin+");";
            break;
        case "custom":
            query = "INSERT INTO ProduitCustom(Nom, Prix, Categorie_idCategorie) VALUES("+x.Nom+","+x.Prix+","+x.Categorie_idCategorie+");";
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

exports.complex = function(req, res){
    var params = req.body.params;
    switch(req.params.type){
        case "produitCommande":

            var query = "";
            console.log(params.selectedCategories);
            query = "SELECT Produitcommande.Quantite, Produitcommande.Details, Produitcommande.Produit_idProduit, "+
                "Produit.Nom, Produit.idProduit, Produit.Categorie_idCategorie, Terminal.Magasin_idMagasin, " +
                "Magasin.Nom AS MagasinNom FROM Produitcommande "+
                "JOIN Produit ON produitCommande.Produit_idProduit = idProduit "+
                "JOIN Commande ON produitCommande.Commande_idCommande = idCommande " +
                "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal "+
                "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                "WHERE "+select_query(params.selectedCategories,"Produit.Categorie_idCategorie");
            if(params.dateLivraison) query = query + " AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
            console.log("complex 1 : "+query);
            connection.query(query , function(errP, rowsP, fields) {
                if (errP) throw errP;
                query = "SELECT Produitcommande.Quantite, Produitcommande.Details, Produitcommande.ProduitCustom_idProduitCustom, "+
                    "ProduitCustom.Nom, ProduitCustom.idProduitCustom, ProduitCustom.Categorie_idCategorie, " +
                    "Magasin.Nom AS MagasinNom, Terminal.Magasin_idMagasin FROM Produitcommande "+
                    "JOIN ProduitCustom ON produitCommande.ProduitCustom_idProduitCustom = idProduitCustom "+
                    "JOIN Commande ON produitCommande.Commande_idCommande = idCommande " +
                    "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal " +
                    "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                    "WHERE "+select_query(params.selectedCategories,"ProduitCustom.Categorie_idCategorie");
                if(params.dateLivraison) query = query + " AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
                console.log("complex 2 : "+query);
                connection.query(query , function(errC, rowsC, fields) {
                    if (errC) throw errC;
                    var result = refactorProduitCommande(rowsP, rowsC);
                    console.log(result);
                    res.send(result);
                });
            });
            break;


        case "commande" :
            debug("DEBUG COMMANDE ##########################");
            /*params : {
                date:'',
                heure:'',
                client:{Nom:'',Tel:'',Mail:'',TVA:''},
                produits:[{
                    prod : {
                        Nom: '',
                        (idProduit: ''),
                        (Prix: ''),
                        Categorie_idCategorie: '',
                        (custom: '')},
                    qty: '',
                    commentaire: ''}
                    ,...],
                remarque:'',
                PNP:'',
                montant:'',
                vendeuse: '',
                (idCommande: '')
            }*/
            /*BON, c'est moche mais �a va le faire. A cause de l'asynchronisme, on est oblig�s de faire des appels imbriqu�s. Voil� la structure du code :
             * INSERT Mots{}
             * INSERT Client{
             *       INSERT Commande{
             *               INSERT de produitcommandes
             *               INSERT produitCustom{
             *                       INSERT produitcommandesCustom
             *               }
             *       }
             * }
             * */
            newMots(params);
            var term = 1;//req.session.data.terminal.idTerminal;
            com_client(params, term);
            res.send('ok');
            break;

        case "vendByMag" :
            debug("VendByMag DEBUG ###################################")
            var n_by_row = 5;
            var vendByMag = {};
            var activeMag  = 1;//req.session.magasin.idMagasin;
            debug("activeMag : "+activeMag)
            connection.query("SELECT * FROM Magasin;", function (err, magasins){
                connection.query("SELECT * FROM Vendeuse;", function (err, vendeuses){
                    for(var m = 0; m < magasins.length; m++){
                        mag = magasins[m];
                        if(mag.display == 1){
                            vendByMag[mag.idMagasin] = {
                                idMagasin:mag.idMagasin
                            }

                            var indice = 0;
                            for(var v = 0; v < vendeuses.length; v++){
                                vend = vendeuses[v];
                                if(vend.display == 1){
                                    i = indice/n_by_row |0;
                                    j = indice % n_by_row;
                                    if(j == 0) vendByMag[mag.idMagasin][i] = {};
                                    vendByMag[mag.idMagasin][i][j] = vend;
                                    indice++;
                                }
                            }
                        }
                    }
                    res.send({
                        activeMag:activeMag,
                        vendByMag:vendByMag
                    });
                });
            });
            break;

        case "produitTable" :
            //TODO REGROUPEMENT
            //TODO ORDERING
            var n_by_row = 4;
            var produitTable = {};
            connection.query("SELECT * FROM Produit;", function (err, produits){
                connection.query("SELECT * FROM Categorie;", function (err, categories){
                    for(var i_categ = 0; i_categ<categories.length; i_categ++){
                        var idCateg = categories[i_categ].idCategorie;
                        produitTable[idCateg] = {indice:0,idCategorie:idCateg};
                    }
                    for(var i_prod = 0; i_prod<produits.length; i_prod++){
                        var prod = produits[i_prod];
                        var idCateg = prod.Categorie_idCategorie;
                        if(prod.display == 1){
                            var indice = produitTable[idCateg].indice;
                            var i = indice/n_by_row | 0 ;
                            var j = indice % n_by_row;
                            if (j==0) produitTable[idCateg][i] = {};
                            produitTable[idCateg][i][j]=prod;
                            produitTable[idCateg].indice = indice+1;
                        }
                    }
                    res.send(produitTable);
                });
            });
            break;
        default:
            console.log("Requete complexe d'un type inconnu : "+req.params.type);
    }
}