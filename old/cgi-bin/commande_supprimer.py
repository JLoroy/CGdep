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
sess = session.Session(expires=365*24*60*60, cookie_path='/')

try:
	conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
except MySQLdb.Error, e:
	print "Error %d: %s" % (e.args[0], e.args[1])
	sys.exit(1)
db = conn.cursor()
print sess.cookie
print "Content-Type: text/html\n"

if params.has_key('id') :
	db.execute("""DELETE FROM Commande WHERE Commande.idCommande='%s'""" % params['id'])
	conn.commit()
else :
	print "ERREUR lors de la suppression de la commande : aucun ID recu"
