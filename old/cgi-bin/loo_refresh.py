#!/usr/bin/env python

import cgi
import cgitb
import MySQLdb as mysqldb
import session, time
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

print "Content-Type: text/html\n"

if params.has_key('selectCateg') :
	allCateg = filter(None, params["selectCateg"].split(";"))
else :
	allCateg = []

if (not params.has_key('date')):
	date = "%%"
else :
	datetmp = filter(None, params["date"].split("/"))
	date = datetmp[2]+"-"+datetmp[0]+"-"+datetmp[1]

for selectCateg in allCateg :
	#TODO : changer db pour ne plus devoir passer par terminal pour le magasin
	#Commande.Livraison=%s AND 
	request = """
	SELECT Produit.Nom, ProduitCommande.Quantite, Magasin.Nom
	FROM ProduitCommande
	INNER JOIN Produit
	ON ProduitCommande.Produit_idProduit=Produit.idProduit
	INNER JOIN Commande
	ON ProduitCommande.Commande_idCommande=Commande.idCommande
	INNER JOIN Terminal
	ON Commande.Terminal_idTerminal=Terminal.idTerminal
	INNER JOIN Magasin
	ON Terminal.Magasin_idMagasin=Magasin.idMagasin
	WHERE Produit.Categorie_idCategorie=%s AND Commande.Livraison LIKE '%s%%'
	;
	""" % (selectCateg, date)
	db.execute(request)

	data = db.fetchall()

	listProduit = list(set([item[0] for item in data]))

	db.execute("""SELECT Magasin.Nom FROM Magasin WHERE 1=1""")

	listMagasin = [item[0] for item in db.fetchall()]

	for produit in listProduit :
		print "<tr><td>%s</td>" % produit
		for magasin in listMagasin :
			print "<td>%s</td>" % sum([item[1] for item in data if (item[0] == produit and item[2] == magasin)])
		print "<td>%s</td></tr>" % sum([item[1] for item in data if (item[0] == produit)])












