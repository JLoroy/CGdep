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

print "Content-Type: text/html\n"

db.execute("""SELECT Produit.Nom, Produit.Prix, Categorie.Nom FROM Produit INNER JOIN Categorie ON Produit.Categorie_idCategorie=Categorie.idCategorie WHERE Produit.Nom LIKE '%%%s%%' LIMIT 0,10;""" % params["query"])

data = db.fetchall()

for item in data :
	print str(item[0]) + "|"

print ";"

for item in data :
	print str(item[1]) + "|"

print ";"

for item in data :
	print str(item[2]) + "|"
