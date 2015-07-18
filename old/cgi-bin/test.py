#!/usr/bin/env python
#!/usr/bin/python

import MySQLdb as mysqldb
import cgi
import cgitb
from idgen import idgen

cgitb.enable()

try:
	conn = mysqldb.connect('localhost', 'root', 'CG14paukSQL', 'CGdb')
except MySQLdb.Error, e:
	print "Error %d: %s" % (e.args[0], e.args[1])
	sys.exit(1)

print 'Content-Type: text/html\n\n'

db = conn.cursor()

db.execute("DELETE FROM Produit WHERE 1=1")
conn.commit()

ID = idgen()

test = ('''
<div>%s</div>
''' % str(ID))

print test

db.execute('''
INSERT INTO Produit(idProduit,Nom,Categorie,Prix)
VALUES (%s,'test','2','42');
'''
% str(ID))
conn.commit()

db.execute('''
SELECT * FROM Produit;
''')

print '<div>'
print 'Produit : ' + str(db.fetchall()[0])
print '</div>'
print '''
<div>
<input type="button" name="testButton" value="+1" onclick="self.location.href='http://192.168.1.5:8000/cgi-bin/test.py'">
</div>
'''

db.close()
conn.close()
