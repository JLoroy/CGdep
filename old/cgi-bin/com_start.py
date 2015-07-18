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
sess = session.Session(expires=24*60*60, cookie_path='/')

validText = ""

if params.has_key('finalVal') :
	validText = """<p align="center" style="color:green">
	Votre commande a bien &eacute;t&eacute; valid&eacute;e !<br/></p>"""
	
	prodChoose = filter(None, sess.data.get('commande').split(";"))
	amountChoose = filter(None, sess.data.get('amount').split(";"))

	#SQL
	try:
		conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
	except MySQLdb.Error, e:
		print "Error %d: %s" % (e.args[0], e.args[1])
		sys.exit(1)
	db = conn.cursor()

	#CLIENT
	db.execute("""SELECT * FROM Client WHERE Nom = '%s' AND Tel = '%s';""" % (sess.data.get('client'), sess.data.get('clientTel')))
	result = db.fetchall()
	idClient = 0
	if len(result) > 0 :
		idClient = result[0][0]
	else :
		insert = """INSERT INTO Client (Inscription, Mail, Tel, Nom) VALUES (%s, %s, %s, %s);"""
		db.execute(insert, (time.strftime("%Y-%m-%d %H:%M:%S"), sess.data.get('clientMail'), sess.data.get('clientTel'), sess.data.get('client')))
		idClient = db.lastrowid
		conn.commit()

	#COMMANDE
	datetmp = filter(None, sess.data.get('date').split("/"))
	dtLivr = datetmp[2]+"-"+datetmp[0]+"-"+datetmp[1]+" "+sess.data.get('heure')
	insert = """
	INSERT INTO Commande (Creation, Livraison, Montant, PNP, Remarque, Client_idClient, Vendeuse_idVendeuse, Terminal_idTerminal) VALUES (%s, %s, %s, %s, %s, %s, %s, %s);
	"""
	#TODO remarque, vendeuse, terminal handler
	db.execute(insert, (time.strftime("%Y-%m-%d %H:%M:%S"), dtLivr, sess.data.get('totAmount'), sess.data.get('payement'), '', idClient, '1', '1'))
	idCommande = db.lastrowid
	conn.commit()

	#PRODUIT COMMANDE
	for i in range(len(prodChoose)) :
		db.execute("""SELECT * FROM Produit WHERE Nom = '%s';""" % (prodChoose[i]))
		insert = """
		INSERT INTO ProduitCommande (Quantite, Details, Commande_idCommande, Produit_idProduit) VALUES (%s, %s, %s, %s);
		"""
		#TODO remarque handler
		db.execute(insert, (amountChoose[i], "", idCommande, db.fetchone()[0]))
		conn.commit()

#Clean/Create session cookie
sess.data['amount'] = ''
sess.data['client'] = ''
sess.data['clientTel'] = ''
sess.data['clientMail'] = ''
sess.data['date'] = ''
sess.data['commande'] = ''
sess.data['heure'] = ''
sess.data['payement'] = ''

print sess.cookie
print "Content-Type: text/html\n"
print open("/var/www/cgi-bin/com_start.html", "r").read() % validText
