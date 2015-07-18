#!/usr/bin/env python

import cgi
import cgitb
import MySQLdb as mysqldb
import session, time, datetime
from utils import fieldStorageToDict
import time
import sys, os
import json

sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
params = fieldStorageToDict(cgi.FieldStorage())
sess = session.Session(expires=365*24*60*60, cookie_path='/')

try:
	conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
except MySQLdb.Error, e:
	print "Error %d: %s" % (e.args[0], e.args[1])
	sys.exit(1)
db = conn.cursor()
print sess.cookie
print "Content-Type: application/json\n"

request = """
SELECT Commande.idCommande, Commande.Livraison, Commande.Montant, Commande.PNP, Commande.Remarque, Commande.Client_idClient, Client.Nom, Client.Tel, Client.Mail, Vendeuse.Nom
FROM Commande
INNER JOIN Client
ON Commande.Client_idClient=Client.idClient
INNER JOIN Terminal
ON Commande.Terminal_idTerminal=Terminal.idTerminal
INNER JOIN Magasin
ON Terminal.Magasin_idMagasin=Magasin.idMagasin
INNER JOIN Vendeuse
ON Commande.Vendeuse_idVendeuse=Vendeuse.idVendeuse
WHERE
"""

if params.has_key('date') :
	request = request + " Commande.livraison LIKE '%s%%' AND" % params['date']
if params.has_key('nom') :
	request = request + " Client.Nom LIKE '%%%s%%' AND" % params['nom']
if params.has_key('magasin') :
	request = request + " Magasin.Nom='%s' AND" % params['magasin']

request = request + " 1=1 LIMIT 0,50;"

db.execute(request)

listCommande = db.fetchall()

data = []

for commande in listCommande :
	commandeDict = {}
	commandeDict['produits'] = []

	db.execute("""
	SELECT ProduitCommande.Produit_idProduit, ProduitCommande.ProduitCustom_idProduitCustom, ProduitCommande.Custom,
	ProduitCommande.Quantite, ProduitCommande.Details
	FROM ProduitCommande
	WHERE ProduitCommande.Commande_idCommande='%s'
	""" % commande[0])
	
	commandeDict['idCommande'] = commande[0]
	commandeDict['Livraison'] = commande[1].strftime("%d/%m/%y - %Hh")
	commandeDict['Date'] = commande[1].strftime("%y-%m-%d")
	commandeDict['Heure'] = commande[1].strftime("%H")
	commandeDict['Montant'] = commande[2]
	commandeDict['PNP'] = "P" if commande[3]==1 else "AF" if commande[3]==2 else "NP"
	commandeDict['Remarque'] = commande[4]
	commandeDict['idClient'] = commande[5]
	commandeDict['NomClient'] = commande[6]
	commandeDict['TelClient'] = commande[7]
	commandeDict['MailClient'] = commande[8]
	commandeDict['NomVendeuse'] = commande[9]

	listProduit = db.fetchall()
	
	for produit in listProduit :
		prodDict = {}
		
		if produit[0] :
			prodDict['idProduit'] = produit[0]
			db.execute("""
			SELECT Produit.Nom, Produit.Prix, Categorie.Nom, Produit.idProduit
			FROM Produit
			INNER JOIN Categorie
			ON Produit.Categorie_idCategorie=Categorie.idCategorie
			WHERE Produit.idProduit='%s'
			""" % produit[0])
		else :
			prodDict['idProduit'] = produit[1]
			db.execute("""
			SELECT ProduitCustom.Nom, ProduitCustom.Prix, Categorie.Nom, ProduitCustom.idProduitCustom
			FROM ProduitCustom
			INNER JOIN Categorie
			ON ProduitCustom.Categorie_idCategorie=Categorie.idCategorie
			WHERE ProduitCustom.idProduitCustom='%s'
			""" % produit[1])
		
		produitDetails = db.fetchone()

		prodDict['Custom'] = "0" if produit[0] else "1"
		prodDict['Quantite'] = produit[3]
		prodDict['Details'] = produit[4]
		prodDict['Nom'] = produitDetails[0]
		prodDict['Prix'] = produitDetails[1]
		prodDict['Categorie'] = produitDetails[2]
		prodDict['idProduit'] = produitDetails[3]

		commandeDict['produits'].append(prodDict)

	data.append(commandeDict)

print json.dumps(data)












