/**
 * Created by Justin on 17-07-15.
 * Possibilité de routing plus propre
 *
 */

exports.remove = function(req, res){
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : 'eu1Thi4iawie',
        database : 'cgdb',
        port     : '3306'
    });
    connection.connect();

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
};