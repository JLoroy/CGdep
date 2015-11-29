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
function Object2Array(input) {
    var out = [];
    for(i in input){
        out.push(input[i]);
    }
    return out;
}
var refactorConsultationPrint = function(produits, customs){
    var result = {};
    var pushResult = function(p){
        if(!(p.idCommande in result)){
            var h = p.Livraison;
            h = h.getHours();
            result[parseInt(p.idCommande)] = {
                //info commande
                idCommande: p.idCommande,
                heure: h,
                clientNom: p.clientNom,
                Remarque: p.Remarque,
                produits:[],
                display: p.display
            };
        }
        result[p.idCommande].produits.push({
            //info produit
            Quantite : p.Quantite,
            produitNom : p.produitNom,
            Detail : p.Details
        })
    }
    for(var i = 0; i< produits.length; i++){
        var p =  produits[i];
        pushResult(p);
    }
    for(var i = 0; i< customs.length; i++){
        var p =  customs[i];
        pushResult(p);
    }
    return Object2Array(result);
};
function DS(date){
    return  date.slice(0,10) + " " + date.slice(11,19);
}

function newMots(params){
    //Todo new mot support
    //any description has new words ? motcuston(idMotCustom, Mot)
    //get all words in a dico {mot:mot}
    var oldMots = {};
    var newMots = {};
    var query_oldMots = "SELECT * FROM MotCustom;"
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
            else{
                debug("mot deja dans le dico :"+mot+":");
                debug(oldMots);
            }
        })
        //rajouter les mots custom
        var query_insert_mots = "INSERT INTO MotCustom(Mot) VALUES ";
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
    var query_client = "SELECT * FROM Client WHERE Nom="+mysql.escape(params.client.Nom)+";";
    connection.query(query_client , function(err, rows, fields) {
        if (err) throw err;
        if (rows.length > 0){

            //2) si il existe, on garde son idClient (et on l'update)
            var Client_idClient = rows[0].idClient;
            var query_update_client = "UPDATE Client SET Tel="+mysql.escape(params.client.Tel)+", Mail ="+mysql.escape(params.client.Mail)+", Nom ="+mysql.escape(params.client.Nom)+", TVA ="+mysql.escape(params.client.TVA)+" WHERE idClient = '"+Client_idClient +"';"
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
                var Client_idClient = result.insertId;
                debug("clientID :"+result.insertId);
                com_commande(params, idTerminal, Client_idClient);
            });


        }
    });
}
function com_commande(params, Terminal_idTerminal, Client_idClient){
    // Commande ( idCommande, Creation, Livraison, Montant, PNP, Remarque, Client_idClient, Vendeuse_idVendeuse, Terminal_idTerminal, display)
    console.log(params);console.log("client:"+Client_idClient);
    //todo gerer la date
    var Livraison = DS(params.Livraison);
    //IF modify Command
    if(params.idCommande){
        var query_delete_produitsCommandes = "DELETE FROM ProduitCommande WHERE Commande_idCommande = "+params.idCommande+";";
        var query_update_commande = "UPDATE Commande SET " +
            "Livraison = '"+Livraison+"',"+
            "Montant = '"+params.montant+"',"+
            "PNP = '"+params.PNP+"',"+
            "Remarque = '"+params.Remarque+"',"+
            "Client_idClient = '"+Client_idClient+"',"+
            "Vendeuse_idVendeuse = '"+params.vendeuse.idVendeuse+"',"+
            "Terminal_idTerminal = '"+params.vendeuse.Magasin_idMagasin+"'" +
            " WHERE idCommande="+params.idCommande+";"
        //les deux d'un coup, oui oui
        debug(query_delete_produitsCommandes+query_update_commande);
        connection.query(query_delete_produitsCommandes, function(err, rows, fields) {
            if (err) throw err;
            connection.query(query_update_commande, function(err, rows, fields) {
                if (err) throw err;
                com_produitcommandes(params);
            });
        });
    }
    //ELSE new Command
    else{
        var Creation = DS(params.Creation);
        var query_insert_commande = "INSERT INTO Commande( Creation, Livraison, Montant, PNP, Remarque, Client_idClient, Vendeuse_idVendeuse, Terminal_idTerminal) VALUES ("+
            "'"+Creation+"','"+Livraison+"',"+"'"+params.montant+"',"+"'"+params.PNP+"',"+mysql.escape(params.Remarque)+","+
            "'"+Client_idClient+"',"+"'"+params.vendeuse.idVendeuse+"',"+"'"+params.vendeuse.Magasin_idMagasin+"');"
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
    var query_insert_produitCommande = "INSERT INTO ProduitCommande(Quantite, Details, Commande_idCommande, Produit_idProduit, Custom) VALUES ";
    for(var indice = 0; indice < params.produits.length; indice ++){
        var p = params.produits[indice];
        //si il est custom, on le rajoute et on indique son id
        if(p.prod.custom){
            //todo check if il existe deja (dans le cas d'une modification de commande)
            if(!p.prod.idProduitCustom) {
                var query_insert_produitCustom = "INSERT INTO ProduitCustom(Nom, Prix, Categorie_idCategorie) VALUES ("+mysql.escape(p.prod.Nom) + "," + 1 + "," + p.prod.Categorie_idCategorie + ");";
                debug(query_insert_produitCustom);
                connection.query(query_insert_produitCustom, function (err, rows, fields) {
                    if (err) throw err;
                    p.prod.idProduitCustom = rows.insertId;
                    debug("produit custom numero "+ p.prod.idProduitCustom);
                    connection.query("INSERT INTO ProduitCommande SET ?",{
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
            query_insert_produitCommande += " ("+p.qty+","+mysql.escape(p.commentaire)+","+params.idCommande+","+p.prod.idProduit+",0)";
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
            "Commande.PNP, Commande.Remarque, Commande.display, Client.Nom AS clientNom, Vendeuse.Nom AS vendeuseNom, Magasin.Nom AS magasinNom "+
            "FROM Commande "+
            "JOIN Terminal ON Commande.Terminal_idTerminal=idTerminal "+
            "JOIN Client ON Commande.Client_idClient=Client.idClient "+
            "JOIN Vendeuse ON Commande.Vendeuse_idVendeuse=Vendeuse.idVendeuse "+
            "JOIN Magasin ON Terminal.Magasin_idMagasin=Magasin.idMagasin "+
            "WHERE "+select_query(params.selectedMagasins,"Terminal.Magasin_idMagasin");
            if(params.dateCreate) query = query + " AND Commande.Creation LIKE '" + params.dateCreate + "%'";
            if(params.dateLivraison) query = query + " AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
            query = query + " ORDER BY Commande.Creation DESC LIMIT 0," + (params.nbrResult?params.nbrResult:"10000");
            break;
        case "produit":
            query = "SELECT * FROM Produit WHERE ";
            query = query + (params.Nom?("Produit.Nom LIKE " + mysql.escape("%"+params.Nom+"%") + " AND "):"") + select_query(params.selectedCategories, "Produit.Categorie_idCategorie") +";";
            break;
        case "client":
            query = "SELECT * FROM Client WHERE Client.Nom LIKE " + mysql.escape("%"+params.Nom+"%") + ";";
            break;
        case "category":
            query = "SELECT * FROM Categorie;";
            break;
        case "magasin":
            query = "SELECT * FROM Magasin WHERE display = 1;";
            break;
        case "vendeuse":
            query = "SELECT * FROM Vendeuse WHERE " + (params.Nom?"Vendeuse.Nom LIKE  " + mysql.escape("%"+params.Nom+"%") + "  ":"")+select_query(params.selectedMagasins,"Vendeuse.Magasin_idMagasin");
            break;
        case "custom":
            query = "SELECT * FROM ProduitCustom WHERE";
            query = query + (params.Nom?("ProduitCustom.Nom LIKE  " + mysql.escape("%"+params.Nom+"%") + "  AND "):"") + select_query(params.selectedCategories, "ProduitCustom.Categorie_idCategorie") +";";
            break;
        case "terminal":
            query = "SELECT * FROM Terminal;";
            break;
        case "ferie":
            query = "SELECT * FROM Ferie;";
            break;
        case "regroupement":
            query = "SELECT * FROM regroupement;";
            break;
        default:
            console.log("Requete d'un type inconnu : "+req.params.type);
    }
    debug("get/"+req.params.type+' : '+query);
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
        case "regroupement":
            query = "INSERT INTO regroupement(Nom, Categorie_idCategorie) VALUES('"+x.Nom+"','"+ x.Categorie_idCategorie+"');";
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
            query = "UPDATE ProduitCustom SET display = 0 WHERE idProduitCustom = '"+rem.idProduitCustom+"';";
            break;
        case "vendeuse":
            query = "UPDATE Vendeuse SET display = 0 WHERE idVendeuse = '"+rem.idVendeuse+"';";
            break;
        case "terminal":
            query = "UPDATE Terminal SET Actif = 0 WHERE idTerminal = '"+rem.idTerminal+"';";
            break;
        case "ferie":
            query = "DELETE FROM Ferie WHERE Ferie.idFerie = "+rem.idFerie+";";
            break;
        case "commande":
            query = "UPDATE Commande SET display = 0 WHERE idCommande = '"+rem.idCommande+"';";
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
            query = "UPDATE Produit SET Nom = '"+mod.Nom+"', Prix = "+mod.Prix+", Categorie_idCategorie = "+mod.Categorie_idCategorie+", regroupement_idRegroupement ="+(mod.regroupement_idRegroupement?mod.regroupement_idRegroupement:"'NULL'")+" WHERE idProduit = '"+mod.idProduit+"';";
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
            query = "UPDATE Vendeuse SET Nom = '"+mod.Nom+"', Magasin_idMagasin = "+mod.Magasin_idMagasin+" WHERE idVendeuse = '"+mod.idVendeuse+"';";
            break;
        case "custom":
            query = "UPDATE ProduitCustom SET Nom = '"+mod.Nom+"', Prix = '"+mod.Prix+"', Categorie_idCategorie = "+mod.categorie+" WHERE idProduitCustom = '"+mod.idProduitCustom+"';";
            break;
        case "terminal":
            query = "UPDATE Terminal SET Magasin_idMagasin = '"+mod.Magasin_idMagasin+"' WHERE idTerminal = '"+mod.idTerminal+"';";
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
    debug('complex');
    var params = req.body.params;
    switch(req.params.type){
        case "produitCommande":
            //region ProduitCommande
            var query = "";
            debug(params.selectedCategories);
            query = "SELECT ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.Produit_idProduit, "+
                "Produit.Nom, Produit.idProduit, Produit.Categorie_idCategorie, Terminal.Magasin_idMagasin, " +
                "Magasin.Nom AS MagasinNom FROM ProduitCommande "+
                "JOIN Produit ON ProduitCommande.Produit_idProduit = idProduit "+
                "JOIN Commande ON ProduitCommande.Commande_idCommande = idCommande " +
                "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal "+
                "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                "WHERE "+select_query(params.selectedCategories,"Produit.Categorie_idCategorie");
            if(params.dateLivraison) query = query + "AND Commande.display = 1 AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
            connection.query(query , function(errP, rowsP, fields) {
                if (errP) throw errP;
                query = "SELECT ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.ProduitCustom_idProduitCustom, "+
                    "ProduitCustom.Nom, ProduitCustom.idProduitCustom, ProduitCustom.Categorie_idCategorie, " +
                    "Magasin.Nom AS MagasinNom, Terminal.Magasin_idMagasin FROM ProduitCommande "+
                    "JOIN ProduitCustom ON ProduitCommande.ProduitCustom_idProduitCustom = idProduitCustom "+
                    "JOIN Commande ON ProduitCommande.Commande_idCommande = idCommande " +
                    "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal " +
                    "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                    "WHERE "+select_query(params.selectedCategories,"ProduitCustom.Categorie_idCategorie");
                if(params.dateLivraison) query = query + "AND Commande.display = 1 AND Commande.Livraison LIKE '" + params.dateLivraison + "%'";
                console.log("complex 2 : "+query);
                connection.query(query , function(errC, rowsC, fields) {
                    if (errC) throw errC;
                    var result = refactorProduitCommande(rowsP, rowsC);
                    res.send(result);
                });
            });
            //endregion
            break;
        case "commande" :
            //region Commande
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
            /*BON, �a va le faire. A cause de l'asynchronisme, on est oblig�s de faire des appels imbriqu�s. Voil� la structure du code :
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

            //todo
            //newMots(params);
            var term = 1;
            if(req.session.data){
                term = req.session.data.terminal.idTerminal;
            console.log(req.session.data.terminal.idTerminal);
            }
            com_client(params, term);
            res.send('ok');
            //endregion
            break;
        case "vendByMag" :
            //region vendByMag
            var n_by_row = 5;
            var vendByMag = {};
            var activeMag  = req.session.data.magasin.idMagasin;
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
                                if(vend.display == 1 && vend.Magasin_idMagasin == mag.idMagasin){
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
        //endregion

        case "produitTable" :
            //TODO REGROUPEMENT
            //TODO ORDERING
            //region produitTable
            var n_by_row = 4;
            var produitTable = {};
            var orderGrp = {};
            connection.query("SELECT * FROM Produit;", function (err, produits){
                connection.query("SELECT * FROM Categorie;", function (err, categories){
                    connection.query("SELECT * FROM regroupement;", function(err, regroupements){
                        //creation des objets categorie
                        for(var i_categ = 0; i_categ<categories.length; i_categ++){
                            var idCateg = categories[i_categ].idCategorie;
                            produitTable[idCateg] = {indice:0,idCategorie:idCateg, row:[]};
                        }
                        //remplissage des categories
                        for(var i_grp = 0; i_grp < regroupements.length; i_grp++){
                            var grp = regroupements[i_grp];
                            grp.produits = [];
                            grp.modType = 'grp';
                            var idCateg = grp.Categorie_idCategorie;
                            if(grp.Display == 1){
                                var indice = produitTable[idCateg].indice;
                                var i = parseInt(indice/n_by_row | 0) ;
                                var j = indice % n_by_row;
                                if (j==0) produitTable[idCateg].row.push({});
                                produitTable[idCateg].row[i][j]=grp;
                                produitTable[idCateg].indice = indice+1;
                                orderGrp[grp.idRegroupement] = {i: i, j: j};
                            }
                        }
                        for(var i_prod = 0; i_prod<produits.length; i_prod++){
                            var prod = produits[i_prod];
                            prod.modType = 'add';
                            var idCateg = prod.Categorie_idCategorie;
                            if(prod.display == 1){
                                if(prod.regroupement_idRegroupement){
                                    var idGrp = prod.regroupement_idRegroupement;
                                    produitTable[idCateg].row[orderGrp[idGrp].i][orderGrp[idGrp].j].produits.push(prod);
                                } else {
                                    var indice = produitTable[idCateg].indice;
                                    var i = parseInt(indice/n_by_row | 0) ;
                                    var j = indice % n_by_row;
                                    if (j==0) produitTable[idCateg].row.push({});
                                    produitTable[idCateg].row[i][j]=prod;
                                    produitTable[idCateg].indice = indice+1;
                                }
                            }
                        }
                        res.send(produitTable);
                    });
                });
            });
            break;
        //endregion

        case "fullCommande":
            //region FullCommande
            var commande = {};
            //first on chope la commande normale a partir de l'ID
            query = "SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, Commande.PNP, Commande.Remarque," +
                " Client.idClient, Client.Nom AS clientNom, Client.Tel, Client.Mail, Client.TVA, " +
                "Magasin.idMagasin, Magasin.Nom AS magasinNom "+
                "FROM Commande "+
                "JOIN Terminal ON Commande.Terminal_idTerminal=idTerminal "+
                "JOIN Client ON Commande.Client_idClient=Client.idClient "+
                "JOIN Magasin ON Terminal.Magasin_idMagasin=Magasin.idMagasin "+
                "WHERE ?";
            connection.query(query, {idCommande:params.idCommande}, function(err, rows){
                commande = {
                    idCommande: rows[0].idCommande,
                    Livraison: rows[0].Livraison,
                    client: {
                        idClient: rows[0].idClient,
                        Nom: rows[0].clientNom,
                        Tel: rows[0].Tel,
                        Mail: rows[0].Mail,
                        TVA: rows[0].TVA
                    },
                    produits: [],
                    Remarque: rows[0].Remarque,
                    PNP: rows[0].PNP,
                    montant: rows[0].Montant
                    //todo vendeuse !!!
                };


                //ensuite, on chope tous les produits command�s et tous les produits custom
                connection.query("SELECT ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.Produit_idProduit, "+
                    "Produit.Nom, Produit.idProduit, Produit.Categorie_idCategorie FROM ProduitCommande "+
                    "JOIN Produit ON ProduitCommande.Produit_idProduit = idProduit WHERE ?", {Commande_idCommande:params.idCommande}, function(err,produits){
                    for(var i = 0; i<produits.length; i++){
                        commande.produits.push({
                            prod: {
                                idProduit:produits[i].idProduit,
                                Nom:produits[i].Nom,
                                Categorie_idCategorie:produits[i].Categorie_idCategorie,
                                custom:false
                            },
                            qty: produits[i].Quantite,
                            commentaire:produits[i].Details
                        });
                    }
                    //Et les produits customs
                    connection.query("SELECT ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.ProduitCustom_idProduitCustom, "+
                        "ProduitCustom.Nom, ProduitCustom.idProduitCustom, ProduitCustom.Categorie_idCategorie FROM ProduitCommande "+
                        "JOIN ProduitCustom ON ProduitCommande.ProduitCustom_idProduitCustom = idProduitCustom WHERE ?", {Commande_idCommande:params.idCommande}, function(err,customs){
                        if(err) throw err;
                        for(var i = 0; i<customs.length; i++){
                            commande.produits.push({
                                prod: {
                                    idProduit:customs[i].idProduitCustom,
                                    Nom:customs[i].Nom,
                                    Categorie_idCategorie:customs[i].Categorie_idCategorie,
                                    custom:true
                                },
                                qty: customs[i].Quantite,
                                commentaire: customs[i].Details
                            });
                        }
                        res.send(commande);
                    });
                });
            });
            //endregion
            break;

        case "consultMagCommande":
            //region consultMagCommande(PRINT)
            /*We need an array of fullcommandes */
            /*params : {Livraison: ''} */
            debug(params);
            var Livraison = DS(params.Livraison).split(' ')[0];
            var activeMag  = req.session.data.magasin.idMagasin;
            var query = "";
            debug(Livraison);
            query = "SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, Commande.PNP, Commande.Remarque, Commande.display, " +
                "Commande.Client_idClient, Client.idClient, Client.Nom AS clientNom, Client.Tel, Client.Mail, Client.TVA, Vendeuse.idVendeuse, Vendeuse.Nom AS vendeuseNom," +
                "Magasin.idMagasin, Magasin.Nom AS magasinNom, ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.Produit_idProduit, "+
                "Produit.Nom AS produitNom, Produit.idProduit, Produit.Categorie_idCategorie, Terminal.Magasin_idMagasin " +
                " FROM ProduitCommande "+
                "JOIN Produit ON ProduitCommande.Produit_idProduit = idProduit "+
                "JOIN Commande ON ProduitCommande.Commande_idCommande = idCommande " +
                "JOIN Client ON Commande.Client_idClient = idClient " +
                "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal "+
                "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                "JOIN Vendeuse ON Commande.Vendeuse_idVendeuse = idVendeuse "+
                "WHERE Commande.Livraison LIKE '" + Livraison + "%' AND "+select_query(params.selectedMagasins,"Terminal.Magasin_idMagasin");
            debug("complex PRINT 1 : "+query);
            connection.query(query , function(errP, rowsP, fields) {
                if (errP) throw errP;
                query = "SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, Commande.PNP, Commande.Remarque, Commande.display, " +
                    "Commande.Client_idClient, Client.idClient, Client.Nom AS clientNom, Client.Tel, Client.Mail, Client.TVA, Vendeuse.idVendeuse, Vendeuse.Nom AS vendeuseNom," +
                    "Magasin.idMagasin, Magasin.Nom AS magasinNom, ProduitCommande.Quantite, ProduitCommande.Details, ProduitCommande.ProduitCustom_idProduitCustom, "+
                    "ProduitCustom.Nom AS produitNom, ProduitCustom.idProduitCustom, ProduitCustom.Categorie_idCategorie, " +
                    "Terminal.Magasin_idMagasin FROM ProduitCommande "+
                    "JOIN ProduitCustom ON ProduitCommande.ProduitCustom_idProduitCustom = idProduitCustom "+
                    "JOIN Commande ON ProduitCommande.Commande_idCommande = idCommande " +
                    "JOIN Client ON Commande.Client_idClient = idClient " +
                    "JOIN Terminal ON Commande.Terminal_idTerminal = idTerminal " +
                    "JOIN Magasin ON Terminal.Magasin_idMagasin = idMagasin "+
                    "JOIN Vendeuse ON Commande.Vendeuse_idVendeuse = idVendeuse "+
                    "WHERE Commande.Livraison LIKE '" + Livraison + "%' AND "+select_query(params.selectedMagasins,"Terminal.Magasin_idMagasin");
                debug("complex PRINT 2 : "+query);
                connection.query(query , function(errC, rowsC, fields) {
                    if (errC) throw errC;
                    var result = refactorConsultationPrint(rowsP, rowsC);
                    res.send(result);
                });
            });
            //endregion
            break;

        case "getRegroupement":
            var regroupements = {};
            connection.query("SELECT * FROM regroupement", function(err, groupes){
                if(err) throw err;
                res.send(groupes);
            });

            break;
        case "addRegroupement":
            //params = {Nom:Nom, Categorie_idCategorie:id, produits:[]}
            connection.query("INSERT INTO regroupement(Nom, Categorie_idCategorie) VALUES('"+params.Nom+"','"+ params.Categorie_idCategorie+"');", function(err, rows){
                if (err) throw err;
                for(var i = 0; i<params.produits.length; i++){
                    connection.query('UPDATE Produit SET regroupement_idRegroupement ='+rows.insertId+' WHERE idProduit='+params.produits[i].idProduit,function(err,rows){
                        if (err) throw err;
                    });
                }
                res.end();
            });
            break;
        case "removeRegroupement":
            //params = {idRegroupement:idRegroupement}
            connection.query("UPDATE regroupement SET display=0 WHERE idRegroupement="+params.idRegroupement, function(err, rows){
                if(err) throw err;
                connection.query("UPDATE Produit SET regroupement_idRegroupement=NULL WHERE regroupement_idRegroupement="+params.idRegroupement, function(err, rows){
                    if(err) throw err;
                    res.end();
                });
            });
            break;
        case "modifyRegroupement":
            break;
        case "currentMagasin":
            if(req.session.data){
                term = req.session.data.terminal.idTerminal;
                connection.query("SELECT * FROM Magasin JOIN Terminal ON Magasin.idMagasin = Magasin_idMagasin WHERE Terminal.idTerminal ="+term+";", function(err, rows){
                    if(err) throw err;
                    res.send(rows);
                });
            }
            else{
                res.send({});
            }
            break;
        default:
            console.log("Requete complexe d'un type inconnu : "+req.params.type);
    }
}