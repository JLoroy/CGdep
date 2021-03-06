#!/usr/bin/env python

import cgi
import cgitb
import MySQLdb as mysqldb
import session, time
from utils import fieldStorageToDict
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
sess = session.Session(expires=24*60*60, cookie_path='/')
params = fieldStorageToDict(cgi.FieldStorage())

print sess.cookie
print "Content-Type: text/html\n"

prodChoose = filter(None, sess.data.get('commande').split(";"))
amountChoose = filter(None, sess.data.get('amount').split(";"))

i = 0
while params.has_key('amount'+str(i)) :
    amountChoose[i] = params['amount'+str(i)]
    i = i+1

try:
    conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
except MySQLdb.Error, e:
    print "Error %d: %s" % (e.args[0], e.args[1])
    sys.exit(1)
db = conn.cursor()

db.execute('''SELECT * FROM Produit''')
prodList = sorted(db.fetchall(), key=lambda tup: tup[0])
prodict = dict(zip((item[1] for item in prodList), (item[2] for item in prodList)))

print """
<!doctype html>
<html>
<head>
	<meta charset="utf-8" />
	<title>Le Coin Gourmand</title>
</head>
<body>
<h1 style="text-align: center;"><strong>Le Coin Gourmand</strong></h1>

<h2 style="font-style: italic; text-align: center;">Payement</h2>

<form action="com_val.py">
<p style="text-align: center;">Commande:</p>

<table align="center" border="0" cellpadding="1" cellspacing="1" style="width: 500px;">
	<tbody>
"""

prodHtml = """
<tr>
    <td>%s</td>
    <td>%s</td>
    <td>%s</td>
    <td>%s</td>
</tr>
"""

total = 0.0;
for i in range(len(prodChoose)) :
    print prodHtml % (prodChoose[i], amountChoose[i], prodict[prodChoose[i]] , str(float(amountChoose[i])*float(prodict[prodChoose[i]])))
    total = total + float(amountChoose[i])*float(prodict[prodChoose[i]])

totHtml = """
<tr>
    <td colspan="3">total :</td>
    <td>%s</td>
</tr>
"""
print totHtml % total

print """
	</tbody>
</table>

<p style="text-align: center;">Payement :&nbsp;<br />
<input name="valider" type="submit" value="A la commande" /><input name="valider" type="submit" value="A la reception" /></p>
</form>

<form action="com_produit.py">
<p style="text-align: center;"><input name="retour" type="submit" value="Retour" /></p>
</form>
</body>
</html>
"""
