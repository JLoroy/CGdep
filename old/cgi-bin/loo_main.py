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

tomorrow = datetime.date.today() + datetime.timedelta(days=1)
#zfill : definir une largeur et rempli de 0 pour atteindre la largeur
strTomorrow = str(tomorrow.month).zfill(2)+"/"+str(tomorrow.day).zfill(2)+"/"+str(tomorrow.year)

print "Content-Type: text/html\n"
print """
<!doctype html>
<html>
	<head>
		<link href="//code.jquery.com/ui/1.11.0/themes/smoothness/jquery-ui.css" rel="stylesheet" />
		<link href="/resources/demos/style.css" rel="stylesheet" />
		<script src="/jquery.js"></script>
		<script src="//code.jquery.com/ui/1.11.0/jquery-ui.js"></script>
		<title>Explorer commande</title>
	</head>
	<body>
		<p>Date: <input id="datepicker" name="date" type="text" value="%s"/></p>
		<form id="selector" action="">
""" % strTomorrow

checkbox = """
<input type="checkbox" name="Categorie" value="%s">%s  
"""

db.execute('''
SELECT * FROM Categorie;
''')

allCateg = sorted(db.fetchall(), key=lambda tup: tup[0])

for i in range(len(allCateg)) :
	print checkbox % (allCateg[i][0], allCateg[i][1])

db.execute('''
SELECT Magasin.Nom FROM Magasin;
''')

listMagasin = db.fetchall()

tabHead = ""

for magasin in listMagasin :
	tabHead = tabHead + "<th>%s</th>" % magasin

print """
		</form>
		<table>
			<thead>
				<th>Produit</th>
				%s
				<th>Total</th>
			</thead>
			<tbody id="mainDiv">
			</tbody>
		</table>
		<script>
			$(function() {
				$( "#datepicker" ).datepicker();
			});
		</script>
		<script src="/loo_main.js"></script>
	</body>
</html>
""" % tabHead
