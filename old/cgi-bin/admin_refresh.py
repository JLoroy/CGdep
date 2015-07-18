#!/usr/bin/env python

import cgi
import cgitb
import MySQLdb as mysqldb
import session, time, datetime
from utils import fieldStorageToDict, idgen
import time
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
params = fieldStorageToDict(cgi.FieldStorage())

try:
	conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
except MySQLdb.Error, e:
	print "Error %d: %s" % (e.args[0], e.args[1])
	sys.exit(1)
db = conn.cursor()

def printFormEmptyProduit() :
	db.execute("SELECT MAX(idProduit) FROM Produit")
	idProduit = int(db.fetchone()[0])+1
	print """
	<form id="produitForm" role="form" class="form-horizontal">
	  <div class="form-group">
	    <label for="produitID" class="col-md-2 control-label">ID</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="produitID" value="%s" disabled>
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="produitNom" class="col-md-2 control-label">Nom</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="produitNom">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="produitPrix" class="col-md-2 control-label">Prix</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="produitPrix">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="produitCategorie" class="col-md-2 control-label">Cat&eacutegorie</label>
	    <div class="col-md-10">
	      <select class="form-control" id="produitCategorie"> """ % idProduit

	db.execute("SELECT Categorie.Nom FROM Categorie WHERE 1=1")
	allCateg = db.fetchall()
	for item in allCateg :
		print "<option>%s</option>" % item[0]

	print """
	      </select>
	    </div>
	  </div>
	  <div class="form-group">
	    <div class="col-md-offset-2 col-md-10">
	      <button type="" id="addProduit" class="btn btn-success disabled">Ajouter</button>
	      <button type="" id="modifyProduit" class="btn btn-primary disabled">Modifier</button>
	      <button type="" id="deleteProduit" class="btn btn-danger disabled">Supprimer</button>
	    </div>
	  </div>
	</form>
	"""
def printFormEmptyClient() :
	db.execute("SELECT MAX(idClient) FROM Client")
	idClient = int(db.fetchone()[0])+1
	print """
	<form id="clientForm" role="form" class="form-horizontal">
	  <div class="form-group">
	    <label for="clientID" class="col-md-2 control-label">ID</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientID" value="%s" disabled>
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="clientNom" class="col-md-2 control-label">Nom</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientNom">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="clientTel" class="col-md-2 control-label">Num&eacutero de t&eacutel&eacutephone</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientTel">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="clientMail" class="col-md-2 control-label">Adresse mail</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientMail">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="clientTVA" class="col-md-2 control-label">TVA</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientTVA">
	    </div>
	  </div>
	  <div class="form-group">
	    <label for="clientInscription" class="col-md-2 control-label">Date d'inscription</label>
	    <div class="col-md-10">
	      <input type="text" class="form-control" id="clientInscription">
	    </div>
	  </div>
	  <div class="form-group">
	    <div class="col-md-offset-2 col-md-10">
	      <button type="" id="addClient" class="btn btn-success disabled">Ajouter</button>
	      <button type="" id="deleteClient" class="btn btn-danger disabled">Supprimer</button>
	    </div>
	  </div>
	</form>""" % idClient

print "Content-Type: text/html\n"

request = ""

if params["selectTab"] == "Commandes":
	if params.has_key('action') and params.has_key('idCommande') and params['action'] == "DELETE" :
		db.execute("""
		DELETE FROM Commande WHERE Commande.idCommande='%s'
		""" % params['idCommande'])
		conn.commit()
	print """
	<table class="table">
		<thead>
			<th>#</th>
			<th>Creation</th>
			<th>Livraison</th>
			<th>Prix</th>
			<th>P/NP</th>
			<th>Remarque</th>
			<th>Client</th>
			<th>Vendeuse</th>
			<th>Magasin</th>
			<th>Supprimer</th>
		</thead>
	"""
	selectMagasin = filter(None, params["selectMagasin"].split(";"))
	if not len(selectMagasin) == 0 :
		request = """
		SELECT Commande.idCommande, Commande.Creation, Commande.Livraison, Commande.Montant, 
		Commande.PNP, Commande.Remarque, Client.Nom, Vendeuse.Nom, Magasin.Nom 
		FROM Commande 
		JOIN Terminal ON Commande.Terminal_idTerminal=idTerminal 
		JOIN Client ON Commande.Client_idClient=Client.idClient 
		JOIN Vendeuse ON Commande.Vendeuse_idVendeuse=Vendeuse.idVendeuse 
		JOIN Magasin ON Terminal.Magasin_idMagasin=Magasin.idMagasin 
		WHERE ("""
		for i in range(len(selectMagasin)) :
			request = request + "Terminal.Magasin_idMagasin=" + selectMagasin[i]
			if not i == (len(selectMagasin)-1) :
				request = request + " OR "
		request = request + ")"
		if params.has_key("dateCreate") :
			request = request + """ AND Commande.Creation LIKE '""" + params["dateCreate"] + """%'"""
		if params.has_key("dateLivraison") :
			request = request + """ AND Commande.Livraison LIKE '""" + params["dateLivraison"] + """%'"""
		request = request + " ORDER BY Commande.Creation DESC LIMIT 0,%s" % (params["nbrResult"] if (params.has_key("nbrResult")) else "20")
	
		db.execute(request)
		data = reversed(sorted(db.fetchall(), key=lambda tup: tup[1]))

		tabRow = """
		<tr>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td>%s</td>
			<td><button class="btn btn-danger deleteCommande" data-idCommande="%s">Supprimer</td>
		</tr
		"""

		for item in data :
			print tabRow % (item[0], item[1], item[2], item[3], "P" if item[4]==1 else "AF" if item[4]==2 else "NP", item[5], item[6], item[7], item[8], item[0])
	print "</table>"
elif params["selectTab"] == "Clients":
	if params.has_key("action"):
		if not params.has_key('clientMail') :
			params['clientMail'] = ""
		if not params.has_key('clientTel') :
			params['clientTel'] = ""
		if not params.has_key('clientTVA') :
			params['clientTVA'] = ""
		#TODO : Decider action onDELETE
		if params["action"] == "DELETE" :
			params["action"] = "DELETE FROM"
		if params["action"] == "INSERT" :
			params["action"] = "INSERT INTO"
		request = ("""%s Client """ % params["action"])
		if params["action"] == "UPDATE" :
			request = request + """SET Client.Nom='%s', Client.Tel='%s', Client.Mail='%s', Client.TVA='%s', Client.Inscription='%s' """ % (params["clientNom"], params["clientTel"], params["clientMail"], params["clientTVA"], params["clientInscription"])
		if params["action"] == "UPDATE" or params["action"] == "DELETE" :
			request = request + """WHERE Client.idClient=%s;""" % params["clientID"]
		if params["action"] == "INSERT INTO" :
			request = request + """ (Client.idClient, Client.Nom, Client.Tel, Client.Mail, Client.TVA, Client.Inscription) VALUES ('%s', '%s', '%s', '%s', '%s', '%s')""" % (params["clientID"], params["clientNom"], params["clientTel"], params["clientMail"], params["clientTVA"], params["clientInscription"])
		db.execute(request)
		conn.commit()
	if params.has_key("NomClient") and not (params.has_key("action") and params["action"] == "DELETE FROM"):
		db.execute("""SELECT Client.idClient, Client.Inscription, Client.Mail, Client.Tel, Client.Nom, Client.TVA 
		FROM Client WHERE Client.Nom='%s'""" % params["NomClient"])
		data = db.fetchone()
		if data :
			print """
			<form id="clientForm" role="form" class="form-horizontal">
			  <div class="form-group">
			    <label for="clientID" class="col-md-2 control-label">ID</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientID" value="%s" disabled>
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="clientNom" class="col-md-2 control-label">Nom</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientNom" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="clientTel" class="col-md-2 control-label">Num&eacutero de t&eacutel&eacutephone</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientTel" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="clientMail" class="col-md-2 control-label">Adresse mail</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientMail" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="clientTVA" class="col-md-2 control-label">Adresse TVA</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientTVA" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="clientInscription" class="col-md-2 control-label">Date d'inscription</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="clientInscription" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <div class="col-md-offset-2 col-md-10">
			      <button type="" id="modifyClient" class="btn btn-primary disabled">Modifier</button>
			      <button type="" id="deleteClient" class="btn btn-danger">Supprimer</button>
			    </div>
			  </div>
			</form>
			""" % (data[0], data[4], data[3], data[2] if data[2] else "", data[5] if data[5] else "", data[1])
		else :
			printFormEmptyClient()
	else :
		printFormEmptyClient()
elif params["selectTab"] == "Produits":
	if params.has_key("action"):
		#TODO : Decider action onDELETE
		if params["action"] == "DELETE" :
			params["action"] = "DELETE FROM"
		if params["action"] == "INSERT" :
			params["action"] = "INSERT INTO"
		request = ("""%s Produit """ % params["action"])
		if params["action"] == "INSERT" :
			request = request + "(idProduit, Nom, Prix, Categorie_idCategorie)"
		if params["action"] == "UPDATE" :
			request = request + """SET Produit.Nom='%s', Produit.Prix='%s' """ % (params["produitNom"], params["produitPrix"])
		if params["action"] == "UPDATE" or params["action"] == "DELETE" :
			request = request + """WHERE Produit.idProduit=%s;""" % params["produitID"]
		if params["action"] == "INSERT INTO" :
			db.execute("SELECT Categorie.idCategorie FROM Categorie WHERE Categorie.Nom='%s'" % params["produitCategorie"])
			produitCategorie = db.fetchone()[0]
			request = request + "VALUES ('%s', '%s', '%s', '%s')" % (params["produitID"], params["produitNom"], params["produitPrix"], produitCategorie)
		db.execute(request)
		conn.commit()
	if params.has_key("NomProduit") and not (params.has_key("action") and params["action"] == "DELETE"):
		db.execute("""SELECT Produit.idProduit, Produit.Nom, Produit.Prix, Categorie.Nom FROM Produit INNER JOIN Categorie ON Produit.Categorie_idCategorie=Categorie.idCategorie WHERE Produit.Nom='%s'""" % params["NomProduit"])
		data = db.fetchone()
		if data :
			print """
			<form id="produitForm" role="form" class="form-horizontal">
			  <div class="form-group">
			    <label for="produitID" class="col-md-2 control-label">ID</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="produitID" value="%s" disabled>
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="produitNom" class="col-md-2 control-label">Nom</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="produitNom" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="produitPrix" class="col-md-2 control-label">Prix</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="produitPrix" value="%s">
			    </div>
			  </div>
			  <div class="form-group">
			    <label for="produitCategorie" class="col-md-2 control-label">Cat&eacutegorie</label>
			    <div class="col-md-10">
			      <input type="text" class="form-control" id="produitCategorie" value="%s" disabled>
			    </div>
			  </div>
			  <div class="form-group">
			    <div class="col-md-offset-2 col-md-10">
			      <button type="" id="addProduit" class="btn btn-success disabled">Ajouter</button>
			      <button type="" id="modifyProduit" class="btn btn-primary disabled">Modifier</button>
			      <button type="" id="deleteProduit" class="btn btn-danger">Supprimer</button>
			    </div>
			  </div>
			</form>
			""" % (data[0], data[1], data[2], data[3])
		else :
			printFormEmptyProduit()
	else :
		printFormEmptyProduit()
elif params["selectTab"] == "Categories":
	if params.has_key("action") :
		#TODO action onDELETE
		if params["action"] == "DELETE" :
			request = "DELETE FROM Categorie WHERE Categorie.idCategorie=%s" % params["categorieID"]
		elif params["action"] == "UPDATE" :
			db.execute("SELECT Categorie.idCategorie FROM Categorie WHERE Categorie.idCategorie=%s" % params["categorieID"])
			if db.fetchone() :
				request = "UPDATE Categorie SET Categorie.Nom='%s' WHERE Categorie.idCategorie=%s" % (params["categorieNom"], params["categorieID"])
			else :
				request = "INSERT INTO Categorie (Categorie.idCategorie, Categorie.Nom) VALUES (%s, '%s')" % (params["categorieID"], params["categorieNom"])
		db.execute(request)
		conn.commit()
	db.execute("SELECT MAX(idCategorie) FROM Categorie WHERE 1=1")
	idCategorie = int(db.fetchone()[0])+1
	print """
	<table class="table">
	  <thead>
	    <th class="col-md-1">ID</th>
	    <th>Nom</th>
	    <th class="col-md-2">Modifier</th>
	    <th class="col-md-2">Supprimer</th>
	  </thead>
	  <tbody>
	    <tr>
	      <td><input type="text" class="form-control" id="categorieID" data-idCategorie="%s" value="%s" disabled></td>
	      <td><input type="text" class="form-control" id="categorieNom" data-idCategorie="%s"></td>
	      <td><button type="" id="addCategorie" class="btn btn-success disabled" data-idCategorie="%s">Ajouter</button>
	      <td><button type="" id="deleteCategorie" class="btn btn-danger disabled" data-idCategorie="%s">Supprimer</button>
	    </tr>""" % (idCategorie, idCategorie, idCategorie, idCategorie, idCategorie)

	db.execute("SELECT Categorie.idCategorie, Categorie.Nom FROM Categorie WHERE 1=1")
	allCateg = db.fetchall()
	for item in allCateg :
		print """
	   	<tr>
	   	  <td><input type="text" class="form-control" id="categorieID" data-idCategorie="%s" value="%s" disabled></td>
	   	  <td><input type="text" class="form-control" id="categorieNom" value="%s" data-idCategorie="%s"></td>
	   	  <td><button type="" id="addCategorie" class="btn btn-primary disabled" data-idCategorie="%s">Modifier</button>
	   	  <td><button type="" id="deleteCategorie" class="btn btn-danger" data-idCategorie="%s">Supprimer</button>
	   	</tr>""" % (item[0], item[0], item[1], item[0], item[0], item[0])

	print """
	  </tbody>
	</table>
	"""
elif params["selectTab"] == "Magasins":
	if params.has_key("action") :
		#TODO action onDELETE
		if params["action"] == "DELETE" :
			request = "DELETE FROM Magasin WHERE Magasin.idMagasin=%s" % params["magasinID"]
		elif params["action"] == "UPDATE" :
			db.execute("SELECT Magasin.idMagasin FROM Magasin WHERE Magasin.idMagasin=%s" % params["magasinID"])
			if db.fetchone() :
				request = "UPDATE Magasin SET Magasin.Nom='%s', Magasin.Adresse='%s' WHERE Magasin.idMagasin=%s" % (params["magasinNom"], params["magasinAdresse"], params["magasinID"])
			else :
				request = "INSERT INTO Magasin (Magasin.idMagasin, Magasin.Nom, Magasin.Adresse) VALUES (%s, '%s', '%s')" % (params["magasinID"], params["magasinNom"], params["magasinAdresse"])
		db.execute(request)
		conn.commit()
	db.execute("SELECT MAX(idMagasin) FROM Magasin WHERE 1=1")
	idMagasin = int(db.fetchone()[0])+1
	print """
	<table class="table">
	  <thead>
	    <th class="col-md-1">ID</th>
	    <th>Nom</th>
	    <th>Adresse</th>
	    <th class="col-md-2">Modifier</th>
	    <th class="col-md-2">Supprimer</th>
	  </thead>
	  <tbody>
	    <tr>
	      <td><input type="text" class="form-control" id="magasinID" data-idMagasin="%s" value="%s" disabled></td>
	      <td><input type="text" class="form-control" id="magasinNom" data-idMagasin="%s"></td>
	      <td><input type="text" class="form-control" id="magasinAdresse" data-idMagasin="%s"></td>
	      <td><button type="" id="addMagasin" class="btn btn-success disabled" data-idMagasin="%s">Ajouter</button>
	      <td><button type="" id="deleteMagasin" class="btn btn-danger disabled" data-idMagasin="%s">Supprimer</button>
	    </tr>""" % (idMagasin, idMagasin, idMagasin, idMagasin, idMagasin, idMagasin)

	db.execute("SELECT Magasin.idMagasin, Magasin.Nom, Magasin.Adresse FROM Magasin WHERE 1=1")
	allCateg = db.fetchall()
	for item in allCateg :
		print """
	   	<tr>
	   	  <td><input type="text" class="form-control" id="magasinID" data-idMAgasin="%s" value="%s" disabled></td>
	   	  <td><input type="text" class="form-control" id="magasinNom" value="%s" data-idMagasin="%s"></td>
	   	  <td><input type="text" class="form-control" id="magasinAdresse" value="%s" data-idMagasin="%s"></td>
	   	  <td><button type="" id="addMagasin" class="btn btn-primary disabled" data-idMagasin="%s">Modifier</button>
	   	  <td><button type="" id="deleteMagasin" class="btn btn-danger" data-idMagasin="%s">Supprimer</button>
	   	</tr>""" % (item[0], item[0], item[1], item[0], item[2], item[0], item[0], item[0])

	print """
	  </tbody>
	</table>
	"""
elif params["selectTab"] == "Personnel":
	if params.has_key("action") :
		if params.has_key("vendeuseMagasin") :
			db.execute("SELECT Magasin.idMagasin FROM Magasin WHERE Magasin.Nom='%s'" % params["vendeuseMagasin"])
			params["vendeuseMagasinID"] = db.fetchone()[0]
		#TODO action onDELETE
		if params["action"] == "DELETE" :
			request = "DELETE FROM Vendeuse WHERE Vendeuse.idVendeuse=%s" % params["vendeuseID"]
		elif params["action"] == "UPDATE" :
			db.execute("SELECT Vendeuse.idVendeuse FROM Vendeuse WHERE Vendeuse.idVendeuse=%s" % params["vendeuseID"])
			if db.fetchone() :
				request = "UPDATE Vendeuse SET Vendeuse.Nom='%s', Vendeuse.Magasin_idMagasin='%s' WHERE Vendeuse.idVendeuse=%s" % (params["vendeuseNom"], params["vendeuseMagasinID"], params["vendeuseID"])
			else :
				request = "INSERT INTO Vendeuse (Vendeuse.idVendeuse, Vendeuse.Nom, Vendeuse.Magasin_idMagasin) VALUES (%s, '%s', '%s')" % (params["vendeuseID"], params["vendeuseNom"], params["vendeuseMagasinID"])
		db.execute(request)
		conn.commit()
	db.execute("SELECT MAX(idVendeuse) FROM Vendeuse WHERE 1=1")
	idVendeuse = int(db.fetchone()[0])+1
	print """
	<table class="table">
	  <thead>
	    <th class="col-md-1">ID</th>
	    <th>Nom</th>
	    <th>Magasin</th>
	    <th class="col-md-2">Modifier</th>
	    <th class="col-md-2">Supprimer</th>
	  </thead>
	  <tbody>
	    <tr>
	      <td><input type="text" class="form-control" id="vendeuseID" data-idVendeuse="%s" value="%s" disabled></td>
	      <td><input type="text" class="form-control" id="vendeuseNom" data-idVendeuse="%s"></td>
	      <td>
	        <select class="form-control" id="vendeuseMagasin" data-idVendeuse="%s"> """ % (idVendeuse, idVendeuse, idVendeuse, idVendeuse)

	db.execute("SELECT Magasin.Nom FROM Magasin WHERE 1=1")
	allMag = db.fetchall()
	for item in allMag :
		print "<option>%s</option>" % item[0]

	print """
	        </select></td>
	      <td><button type="" id="addVendeuse" class="btn btn-success disabled" data-idVendeuse="%s">Ajouter</button>
	      <td><button type="" id="deleteVendeuse" class="btn btn-danger disabled" data-idVendeuse="%s">Supprimer</button>
	    </tr>""" % (idVendeuse, idVendeuse)

	db.execute("SELECT Vendeuse.idVendeuse, Vendeuse.Nom, Magasin.Nom FROM Vendeuse INNER JOIN Magasin ON Vendeuse.Magasin_idMagasin=Magasin.idMagasin WHERE 1=1")
	allProd = db.fetchall()
	for item in allProd :
		print """
	   	<tr>
	   	  <td><input type="text" class="form-control" id="vendeuseID" data-idVendeuse="%s" value="%s" disabled></td>
	   	  <td><input type="text" class="form-control" id="vendeuseNom" value="%s" data-idVendeuse="%s"></td>
		  <td>
	  	    <select class="form-control" id="vendeuseMagasin" data-idVendeuse="%s"> """ % (item[0], item[0], item[1], item[0], item[0])

		db.execute("SELECT Magasin.Nom FROM Magasin WHERE 1=1")
		allMag = db.fetchall()
		for item2 in allMag :
			if item2[0] == item[2] :
				print "<option selected>%s</option>" % item2[0]
			else :
				print "<option>%s</option>" % item2[0]

		print """
	            </select></td>
	   	  <td><button type="" id="addVendeuse" class="btn btn-primary disabled" data-idVendeuse="%s">Modifier</button>
	   	  <td><button type="" id="deleteVendeuse" class="btn btn-danger" data-idVendeuse="%s">Supprimer</button>
	   	</tr>""" % (item[0], item[0])

	print """
	  </tbody>
	</table>
	"""



elif params["selectTab"] == "Terminaux":
	if params.has_key("action") :
		if params.has_key("terminalMagasin") :
			db.execute("SELECT Magasin.idMagasin FROM Magasin WHERE Magasin.Nom='%s'" % params["terminalMagasin"])
			params["terminalMagasinID"] = db.fetchone()[0]
		if params["action"] == "DELETE" :
			request = "UPDATE Terminal SET Terminal.Actif=0 WHERE Terminal.idTerminal=%s" % params["terminalID"]
		elif params["action"] == "UPDATE" :
			db.execute("SELECT Terminal.idTerminal FROM Terminal WHERE Terminal.idTerminal=%s" % params["terminalID"])
			if db.fetchone() :
				db.execute("""INSERT INTO Terminal (Terminal.Magasin_idMagasin) 
				VALUES ('%s')""" % (params["terminalMagasinID"]))
				conn.commit()
				request = """UPDATE Terminal SET Terminal.Actif=0 
				WHERE Terminal.idTerminal=%s""" % params["terminalID"]
			else :
				request = "INSERT INTO Terminal (Terminal.Magasin_idMagasin) VALUES ('%s')" % (params["terminalMagasinID"])
		db.execute(request)
		conn.commit()
	db.execute("SELECT MAX(idTerminal) FROM Terminal WHERE 1=1")
	idTerminal = int(db.fetchone()[0])+1
	print """
	<table class="table">
	  <thead>
	    <th class="col-md-1">ID</th>
	    <th>Magasin</th>
	    <th class="col-md-2">Modifier</th>
	    <th class="col-md-2">Supprimer</th>
	  </thead>
	  <tbody>
	    <tr>
	      <td><input type="text" class="form-control" id="terminalID" data-idTerminal="%s" value="%s" disabled></td>
	      <td>
	        <select class="form-control" id="terminalMagasin" data-idTerminal="%s"> """ % (idTerminal, idTerminal, idTerminal)

	db.execute("SELECT Magasin.Nom FROM Magasin WHERE 1=1")
	allMag = db.fetchall()
	for item in allMag :
		print "<option>%s</option>" % item[0]

	print """
	        </select></td>
	      <td><button type="" id="addTerminal" class="btn btn-success disabled" data-idTerminal="%s">Ajouter</button>
	      <td><button type="" id="deleteTerminal" class="btn btn-danger disabled" data-idTerminal="%s">Supprimer</button>
	    </tr>""" % (idTerminal, idTerminal)

	db.execute("""SELECT Terminal.idTerminal, Magasin.Nom 
	FROM Terminal 
	INNER JOIN Magasin 
	ON Terminal.Magasin_idMagasin=Magasin.idMagasin
	WHERE Terminal.Actif=1""")
	allProd = db.fetchall()
	for item in allProd :
		print """
	   	<tr>
	   	  <td><input type="text" class="form-control" id="terminalID" data-idTerminal="%s" value="%s" disabled></td>
	   	  <td>
	  	    <select class="form-control" id="terminalMagasin" data-idTerminal="%s"> """ % (item[0], item[0], item[0])

		db.execute("SELECT Magasin.Nom FROM Magasin WHERE 1=1")
		allMag = db.fetchall()
		for item2 in allMag :
			if item2[0] == item[1] :
				print "<option selected>%s</option>" % item2[0]
			else :
				print "<option>%s</option>" % item2[0]

		print """
	            </select></td>
	   	  <td><button type="" id="addTerminal" class="btn btn-primary disabled" data-idTerminal="%s">Modifier</button>
	   	  <td><button type="" id="deleteTerminal" class="btn btn-danger" data-idTerminal="%s">Supprimer</button>
	   	</tr>""" % (item[0], item[0])

	print """
	  </tbody>
	</table>
	"""

elif params["selectTab"] == "Ferie":
	if params.has_key("action") :
		if params["action"] == "INSERT" :
			request = "INSERT INTO Ferie (Ferie.Date) VALUES ('%s')" % params["ferieDate"]
		else :
			request = "DELETE FROM Ferie WHERE Ferie.idFerie='%s'" % params["ferieID"]
		db.execute(request)
		conn.commit()
	
	db.execute("SELECT Ferie.idFerie, Ferie.Date FROM Ferie WHERE Ferie.Date>'%s'" % datetime.date.today().strftime("%Y-%m-%d"))
	
	allFerie = db.fetchall()

	print """
	<table class="table">
	  <thead>
	    <th class="col-md-1">ID</th>
	    <th class="col-md-3">Date</th>
	    <th class="col-md-2">Supprimer</th>
	  </thead>
	  <tbody>
	"""

	for ferie in allFerie :
		print """
		<tr>
		  <td>%s</td>
		  <td>%s</td>
		  <td><button class="btn btn-danger btn-block delFerie" data-idferie="%s">Supprimer</button></td>
		</tr>
		""" % (ferie[0], ferie[1], ferie[0])

	print """
	  </tbody>
	</table>
	"""

else :
	print params

