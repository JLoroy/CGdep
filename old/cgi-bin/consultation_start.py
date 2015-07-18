#!/usr/bin/env python
# -*-coding:Latin-1 -*

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

db.execute("SELECT Categorie.idCategorie, Categorie.Nom FROM Categorie")

allCategorie = sorted(db.fetchall(), key=lambda tup: tup[0])

db.execute('''
SELECT Magasin.idMagasin, Magasin.Nom FROM Magasin;
''')
listMagasin = db.fetchall()

if sess.data.get('selectCategorie') == None :
	selectCategorie = ""
	for categ in allCategorie :
		selectCategorie = selectCategorie + str(categ[0]) + ";"
	sess.data['selectCategorie'] = selectCategorie

selectCateg = filter(None, sess.data.get('selectCategorie').split(";"))

print sess.cookie
print "Content-Type: text/html\n"
print """
<!doctype html>
<html style="height:100%;">
  <head>
    <meta charset="utf-8">
    <script src="/jquery.js"></script>
    <script src="/printThis.js"></script>
    <script src="/bootstrap/js/bootstrap.js"></script>
    <script src="/bootstrap/js/bootstrap-datepicker.js"></script>
    <script src="/bootstrap/js/typeahead.js"></script>
    <script src="/bootstrap/js/handlebars.js"></script>
    <link href="/bootstrap/css/bootstrap.css" rel="stylesheet" />
    <link href="/bootstrap/css/datepicker.css" rel="stylesheet" />
    <link href="/bootstrap/css/typeahead.css" rel="stylesheet" />
    <link href="/cgcss.css" rel="stylesheet" />
    <title>Interface de consultation</title>
  </head>
  <body style="height:100%;">"""
#    <div id="divMagasin" style="height:100%;">
#      <table class="table table-bordered col-md-12" style="height:100%;">
#"""
#
#btnMag = """<td class="col-md-6 btn btn-default btn-lg vcenter" data-idmagasin="%s">%s</td>"""
#
#i = 0
#while i < len(listMagasin) :
#	print "<tr>"
#	for j in range(2) :
#		if i < len(listMagasin) :
#			print btnMag % (listMagasin[i][0], listMagasin[i][1])
#		else :
#			print btnMag % (""" " style="display: none""", "")
#		i = i+1
#	print "</tr>"
#
#print """
#      </table>
#    </div>
#"""
#
print """
    <div id="divDate">
      <table class="table table-bordered" style="width:100%;"> 
        <tr>
"""

dateBtn = """
          <td class="col-md-1" style="border:none; !important">
          <button value="%s" class="btnDate btn btn-lg btn-block btn-default%s">
            <label>%s</label><br/><p>%s</p>
          </button>
          </td> 
"""

def switchDay(day):
	if day == "Monday":
		return "Lundi"
	elif day == "Tuesday":
		return "Mardi"
	elif day == "Wednesday":
		return "Mercredi"
	elif day == "Thursday":
		return "Jeudi"
	elif day == "Friday":
		return "Vendredi"
	elif day == "Saturday":
		return "Samedi"
	elif day == "Sunday":
		return "Dimanche"

oneDay = datetime.timedelta(days=1)
today = datetime.date.today()
idToday = today.weekday()
dayBtn = datetime.date.today() - datetime.timedelta(days=idToday)

for i in range(28) :
	detail = ''
	if i < idToday :
		detail = ' disabled'
	if i%7 == 5 :
		detail = detail + '" style="background-color:MediumSeaGreen;'
	elif i%7 == 6 :
		detail = detail + '" style="background-color:IndianRed;'
	print dateBtn % (i-idToday, detail, switchDay(dayBtn.strftime("%A")), dayBtn.strftime("%d/%m"))
	if i%7 == 6 :
		print "</tr><tr>"
	dayBtn = dayBtn + oneDay

#Pour la réimplémentation datepicker start & end
'''        <div class="form-group">
          <label for="commandeStartDate" class="col-md-2 control-label">Date de d&eacutepart</label>
          <div class="input-group col-md-9">
            <input id="dpCommandeStart" type="text" placeholder="Entrez une date" class="form-control">
            <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
          </div>
        </div>
        <div class="form-group">
          <label for="commandeEndDate" class="col-md-2 control-label">Date de fin</label>
          <div class="input-group col-md-9">
            <input id="dpCommandeEnd" type="text" placeholder="Entrez une date" class="form-control">
            <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
          </div>
        </div>'''

print """        
        </tr>   
      </table>
    </div>
    <div id="divConsultation" hidden style="padding:10px; !important">
      <button type="button" id="dateModif" class="btn btn-lg btn-primary col-md-1">
        Date...
      </button>"""
#      <button type="button" id="magasinModif" class="btn btn-lg btn-primary col-md-1" style="margin-left:2px; !important">
#        Magasin...
#      </button>
print """
      <div id="selectorCategorie" class="col-md-8 col-md-offset-1" data-toggle="buttons" style="text-align:center !important;">"""

checkButton = """
<label class="noHover btn btn-lg btn-primary%s">
  <input type="checkbox" value="%s" checked> %s
</label>
"""

db.execute("SELECT Categorie.idCategorie, Categorie.Nom FROM Categorie")

allCategorie = sorted(db.fetchall(), key=lambda tup: tup[0])

for i in range(len(allCategorie)) :
	if str(allCategorie[i][0]) in selectCateg :
		check = " active"
	else :
		check = ""
	print checkButton % (check, allCategorie[i][0], allCategorie[i][1])

tabHead = ""

for magasin in listMagasin :
	tabHead = tabHead + "<th>%s</th>" % magasin[1]

print """
      </div>
      <button type="button" id="imprimer" class="btn btn-lg btn-primary col-md-1 col-md-offset-1">Imprimer</button>
      <table id="toPrint" class="table">
        <thead>
          <th class="col-md-3">Produit</th>
            %s
          <th>Total</th>
        </thead>
        <tbody id="mainDiv">
        </tbody>
      </table>
      <div class="col-md-12">
        <span id="countdown" class="timer">Actualisation dans </span>
      </div>
""" % tabHead

print """
    </div>
    <script src="/consultation_main.js"></script>
  </body>
</html>
"""
