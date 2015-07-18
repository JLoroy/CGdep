#!/usr/bin/env python

import cgi
import cgitb
import session, time
import MySQLdb as mysqldb
from utils import fieldStorageToDict
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
sess = session.Session(expires=24*60*60, cookie_path='/')
params = fieldStorageToDict(cgi.FieldStorage())

if params.has_key('valider') :
	sess.data['payement'] = "1" if params['valider']=="A la commande" else "0"

print sess.cookie
print "Content-Type: text/html\n"

error = False
try :
	if not sess.data.get('date') == "" or not sess.data.get('heure') == "" or not sess.data.get('client') == "" or not sess.data.get('commande') or not sess.data.get('amount') or not sess.data.get('payement'):
		pass
except :
	error = True
	print open("/var/www/cgi-bin/com_error.html", "r").read() % "Payement"

if not error :
	htmlargs = {"client" : sess.data.get('client'), "clientTel" : sess.data.get('clientTel'), "clientMail" : sess.data.get('clientMail'), "date" : sess.data.get('date'), "heure" : sess.data.get('heure'), "payement" : "Pay&eacute;" if sess.data.get('payement') == "1" else "Non pay&eacute;"}
	print open("/var/www/cgi-bin/com_val.html", "r").read() % htmlargs

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

	sess.data['totAmount'] = str(total)

	print totHtml % total

	print """
		</tbody>
	</table>
	<p style="text-align: center"><input name="finalVal" type="submit" value="Valider" /></p>
	</form>

	<form action="com_payement.py">
	<p style="text-align: center"><input name="retour" type="submit" value="Retour" /></p>
	</form>
	</body>
	</html>
	"""


