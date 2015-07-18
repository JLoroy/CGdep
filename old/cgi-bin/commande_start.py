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

print sess.cookie

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



db.execute("SELECT Ferie.idFerie, Ferie.Date FROM Ferie WHERE Ferie.Date>'%s'" % datetime.date.today().strftime("%Y-%m-%d"))
feries = db.fetchall()
allFerie = [item[1] for item in list(feries)]

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
    <title>Interface de commande</title>
  </head>
  <body style="height:100%;">
  <!-- CHOIX VENDEUSE -->
  <div id="choixVendeuse" style="height:100%;">
    <ul class="nav nav-pills" role="tablist">
"""

tabVend = """<li%s><a href="#vendeuse%s" role="tab" data-toggle="tab" data-idmagasin="%s">%s</a></li>"""
btnVend = """<td class="col-md-3 btn btn-default btn-lg vcenter" data-idvendeuse="%s" style="height:50%% !important;%s">%s<img src="/image/vendeuses/%s.jpg" class="center-block" style="max-width: 100%% !important; max-height:100%% !important;"></td>"""

db.execute("SELECT Categorie.idCategorie, Categorie.Nom FROM Categorie;")
allCateg = sorted(db.fetchall(), key=lambda tup: tup[0])

db.execute("SELECT Magasin.idMagasin, Magasin.Nom FROM Magasin;")
allMag = sorted(db.fetchall(), key=lambda tup: tup[0])

thisMag = 0

if sess.data.get('idTerminal') :
	db.execute("""SELECT Terminal.Magasin_idMagasin, Magasin.Nom 
	FROM Terminal
	INNER JOIN Magasin
	ON Terminal.Magasin_idMagasin=Magasin.idMagasin
	WHERE Terminal.idTerminal='%s'""" % sess.data.get('idTerminal'))
	thisMag = allMag.index(db.fetchone())

for i in range(len(allMag)) :
	print tabVend % (""" class="active" """ if (i==thisMag) else "", allMag[i][0], allMag[i][0], allMag[i][1])

print """
          </ul>
          <!-- Tab panes -->
          <div class="tab-content" id="vendeuseBtnDiv" style="height:100%;">
"""

for k in range(len(allMag)) :
	print """
            <div class="tab-pane%s" id="vendeuse%s" style="height:100%%;">
	      <table class="table table-bordered col-md-12" style="height:90%%;">
	""" % (" active" if (k==thisMag) else "", allMag[k][0])

	db.execute("SELECT Vendeuse.idVEndeuse, Vendeuse.Nom FROM Vendeuse WHERE Vendeuse.Magasin_idMagasin=%s" % allMag[k][0])
	listVend = sorted(db.fetchall(), key=lambda tup: tup[0])


	i = 0
	while i < len(listVend) :
		print "<tr>"
		for j in range(4) :
			if i < len(listVend) :
				if os.path.exists("/var/www/image/vendeuses/%s.jpg" % listVend[i][0]) :
					print btnVend % (str(listVend[i][0]), " background-color: WhiteSmoke;" if(listVend[i][1] == "Vendeuse anonyme") else "", str(listVend[i][1]), listVend[i][0])
				else :
					print btnVend % (str(listVend[i][0]), " background-color: WhiteSmoke;" if(listVend[i][1] == "Vendeuse anonyme") else "", listVend[i][1], "default")
			else :
				print btnVend % (""" " style="display: none""", "", "", "default")
			i = i+1
		print "</tr>"

	print """
	      </table>
            </div>
        """

print """
    </div>
  </div>
  <!-- MENU PRINCIPAL -->
  <div id="mainMenu" hidden class="fill" style="height:100%;">
    <div class="col-md-6 fill" style="height:100%;">
      <button type="button" class="fill btn btn-primary btn-lg btn-block" style="height:100%;" id="commandeBtn">Commander</button>
    </div>
    <div class="col-md-6 fill " style="height:100%;">
      <button type="button" class="fill btn btn-primary btn-lg btn-block" style="height:100%;" id="consultationBtn">Consulter / Modifier</button>
    </div>
  </div>
  <!-- APPLICATION CONSULTATION -->
  <div id="divDateConsult" hidden>
    <table class="table table-bordered" style="width:100%;"> 
      <tr>
"""

dateBtn = """
        <td class="col-md-1" style="border:none; !important">
        <button value="%s" class="btnDateCons btn btn-lg btn-block btn-default%s">
          <label>%s</label><br/><p>%s</p>
        </button>
        </td> 
"""

oneDay = datetime.timedelta(days=1)
today = datetime.date.today()
idToday = today.weekday()
dayBtn = datetime.date.today() - datetime.timedelta(days=idToday)

for i in range(28) :
	detail = ''
	if i < idToday :
		detail = ' disabled'
	if (dayBtn in allFerie) :
		detail = detail + ' " style="background-color:CornflowerBlue;'
	else :
		if i%7 == 5 :
			detail = detail + '" style="background-color:MediumSeaGreen;'
		elif i%7 == 6 :
			detail = detail + '" style="background-color:IndianRed;'
	print dateBtn % (i-idToday, detail, switchDay(dayBtn.strftime("%A")), dayBtn.strftime("%d/%m"))
	if i%7 == 6 :
		print "</tr><tr>"
	dayBtn = dayBtn + oneDay

print """        
      </tr>   
    </table>
  </div>
  <div id="consultationAPP" hidden>
    <button type="button" id="retourConsultation" class="btn btn-lg btn-danger col-md-1">Retour</button>
    <button type="button" id="retourDateConsultation" class="btn btn-lg btn-primary col-md-offset-1 col-md-1">Date...</button>
    <form role="form" class="col-md-1 form-horizontal">
      <div class="input-group form-group">
        <input id="dateConsultation" type="text" class="form-control" placeholder="Entrez une date">
        <span class="input-group-addon glyphicon glyphicon-remove clearInput">
        </span>
      </div>
    </form>
    <form role="form" class="col-md-offset-1 col-md-2 form-horizontal">
      <div class="form-group">
        <input id="nomConsultation" type="text" class="typeahead form-control" placeholder="Entrez un nom">
      </div>
    </form>
    <form role="form" class="col-md-offset-1 col-md-2 form-horizontal">
      <select id="magasinConsultation" class="form-control">
"""

magOption = """<option%s value="%s">%s</option>"""

for i in range(len(allMag)) :
	print magOption % (" selected" if (i==thisMag) else "", allMag[i][1], allMag[i][1])

print """
      </select>
    </form>
    <button type="button" id="imprimerConsultation" class="btn btn-lg btn-primary col-md-offset-1 col-md-1">Imprimer</button>
    <div class="col-md-10 col-md-offset-1">
      <table id="toPrintConsultation" class="table">
        <thead>
          <th class="col-md-1">Heure</th>
          <th class="col-md-2">Client</th>
          <th class="col-md-1">T&eacutel&eacutephone</th>
          <th class="col-md-2">Commentaire</th>
          <th class="col-md-1">P/NP</th>
          <th class="col-md-1">Prix</th>
          <th class="col-md-2">Vendeuse</th>
          <th class="col-md-1">Modifier</th>
          <th class="col-md-1">Supprimer</th>
        </thead>
        <tbody id="consultContent">
        </tbody>
      </table>
    </div>
    <div class="modal fade" id="popupSupprimerConsultation">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close clearComm" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
            <h4 class="modal-title">Etes-vous certain de vouloir supprimer cette commande?</h4>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Annuler</button>
            <button type="button" id="launchSupressConsultation" class="btn btn-danger" data-dismiss="modal">Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- APPLICATION COMMANDE -->
  <div id="commandeAPP" class="fill" style="height:95%;" hidden>
    <!-- Nav tabs -->
    <ul id="mainTab" class="nav nav-tabs" role="tablist">
      <li data-target="date" class="active"><a href="#date" role="tab" data-toggle="tab">Date</a></li>
      <li data-target="heure" class="disabled"><a href="#heure" role="tab" data-toggle="tab">Heure</a></li>
      <li data-target="client" class="disabled"><a href="#client" role="tab" data-toggle="tab">Client</a></li>
      <li data-target="pr</label><br/><p>%s</p>oduit" class="disabled"><a href="#produit" role="tab" data-toggle="tab">Produits</a></li>
      <li data-target="commentaire" class="disabled"><a href="#commentaire" role="tab" data-toggle="tab">Commentaire</a></li>
      <li data-target="payement" class="disabled"><a href="#payement" role="tab" data-toggle="tab">Payement</a></li>
      <li data-target="recapitulatif" class="disabled"><a href="#recapitulatif" role="tab" data-toggle="tab">Recapitulatif</a></li>
    </ul>
    <!-- Tab panes -->
    <div id="allTabContentCommande" class="fill tab-content" style="height:100%;">
      <div class="tab-pane fade active in" id="date">
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

oneDay = datetime.timedelta(days=1)
today = datetime.date.today()
idToday = today.weekday()
dayBtn = datetime.date.today() - datetime.timedelta(days=idToday)

for i in range(28) :
	detail = ''
	if (i <= idToday) or (dayBtn.month == 1 and dayBtn.day == 1) :
		detail = ' disabled'
	if (dayBtn in allFerie) :
		detail = detail + ' " style="background-color:CornflowerBlue;'
	else :
		if i%7 == 5 :
			detail = detail + '" style="background-color:MediumSeaGreen;'
		elif i%7 == 6 :
			detail = detail + '" style="background-color:IndianRed;'
	print dateBtn % (i-idToday, detail, switchDay(dayBtn.strftime("%A")), dayBtn.strftime("%d/%m"))
	if i%7 == 6 :
		print "</tr><tr>"
	dayBtn = dayBtn + oneDay


print """        
          </tr>   
        </table>
        <div style="padding-top:20px;">
        <form role="form" class="form-horizontal">
          <div class="form-group">
            <label for="dateLivraison" class="col-md-2 control-label">Autre date</label>
            <div class="input-group col-md-6">
              <input id="dateLivraison" type="text" placeholder="Entrez une date" class="form-control">
              <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
            </div>
          </div>
        </form>
        </div>
      </div>
      <div class="tab-pane fade" id="heure">"""


for h in range(11):
	hstr = str(h+6) if h>3 else "0"+str(h+6) 
	print """
        <div class="row" style="padding:10px;">
          <button value="%s" id="heure%s" class="heureLivraison btn btn-lg btn-default col-md-4 col-md-offset-4">%s</button>
        <br/></div>""" % (hstr+":00:00", hstr, hstr+"h")
        
print """
      </div>
      <div class="tab-pane fade" id="client">
        <form id="clientForm" role="form" class="form-horizontal">
          <div class="patch-zoom-bug form-group">
            <label for="clientNom" class="col-md-2 control-label">Nom</label>
            <div class="col-md-6" style="width:980px !important;">
              <input id="clientNom" type="text" class="form-control patch-zoom-bug">
            </div>
          </div>
          <div class="form-group">
            <label for="clientTel" class="col-md-2 control-label">T&eacutel&eacutephone</label>
            <div class="col-md-6">
              <input id="clientTel" type="tel" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label for="clientMail" class="col-md-2 control-label">Mail</label>
            <div class="col-md-6">
              <input id="clientMail" type="email" class="form-control">
            </div>
          </div>
          <div class="form-group">
            <label for="clientTVA" class="col-md-2 control-label">TVA</label>
            <div class="input-group col-md-6" style="padding-right:14px !important; padding-left:14px !important;">
              <span class="input-group-addon">BE</span>
              <input id="clientTVA" type="number" max="9999999999" class="form-control">
            </div>
          </div>
        </form>
      </div>
      <div class="tab-pane fade" id="produit">
        <div class="col-md-4" style="border-right: 1px solid gray;">
          <form role="form">
            <div class="form-group">
              <label for="listProduit" class="control-label">Produits</label>
              <ul id="listProduit" class="list-group">
                
              </ul>
            </div>
            <div class="form-group">
              <label for="totalProduit" class="control-label">Total</label>
              <input id="prix" type="text" class="form-control prixTot" value="0 EUR" disabled>
            </div>
          </form>
        </div>
        <div class="col-md-8" style="border-left: 1px solid gray; margin-left: -1px;padding-left:0px !important;padding-right:0px !important;">
          <div class="col-md-2" style="padding-top:10px !important;">"""
#            <ul class="nav nav-pills" role="tablist">"""

#tabProduit = """<li%s><a href="#produit%s" role="tab" data-toggle="tab" data-idcategorie="%s">%s</a></li>"""
tabProduit = """
<div class="col-md-12" style="padding-top:5px !important;padding-left:0px !important;padding-right:0px !important;">
  <button href="#produit%s" role="tab" data-toggle="tab" data-idcategorie="%s" class="btn-produit-categ btn btn-default btn-block btn-lg%s" style="height:90px !important;">
      %s
  </button>
</div>"""
btnProduit = """<td class="col-md-3" style="border:none; !important"><button type="button" class="btn btn-default btn-lg btn-block" data-prix="%s" value="%s">%s</button></td>"""
    
for i in range(len(allCateg)) :
	#print tabProduit % (""" class="active" """ if (i==0) else "", allCateg[i][0], allCateg[i][0], allCateg[i][1])
	print tabProduit % (allCateg[i][0], allCateg[i][0], """ active""" if (i==0) else "", allCateg[i][1])


#            </ul>
print """
          </div>
          <!-- Tab panes -->
          <div class="tab-content col-md-10" id="produitBtnDiv">
"""

for k in range(len(allCateg)) :
	print """
            <div class="tab-pane%s" id="produit%s">
	      <table class="table table-bordered col-md-12">
	""" % (" active" if (k==0) else "", allCateg[k][0])

	db.execute("SELECT Produit.idProduit, Produit.Nom, Produit.Prix FROM Produit WHERE Produit.Categorie_idCategorie=%s" % allCateg[k][0])
	listProd = sorted(db.fetchall(), key=lambda tup: tup[0])

	i = 0
	while i < len(listProd) :
		print "<tr>"
		for j in range(4) :
			if i < len(listProd) :
				print btnProduit % (listProd[i][2], listProd[i][0], listProd[i][1])
			else :
				print btnProduit % ("", """ " style="display: none""", "")
			i = i+1
		print "</tr>"

	print """
	      </table>
            </div>
        """
#TODO : suivant et retour sur les cotes cf:idee clem
print """
          </div>
          <div class="col-md-offset-3 col-md-6">
            <button type="button" class="btn btn-primary btn-lg btn-block" data-toggle="modal" data-target="#customModal">Produit personnalis&eacute...</button>
          </div>
          <div class="modal fade" id="customModal" role="dialog" data-backdrop="static" keyboard="false">
            <div class="modal-dialog modal-lg">
              <div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true">&times;</span>
                    <span class="sr-only">Close</span>
                  </button>
                  <h4 class="modal-title">Produit personnalis&eacute</h4>
                </div>
                <div class="modal-body">
                  <form class="form-horizontal">
                    <div class="form-group">
                      <label class="col-md-2 control-label">Entr&eacutee produit</label>
                      <div class="col-md-10">
                        <textarea id="nomCustom" type="text" class="typeahead form-control" placeholder="Description du produit"></textarea>
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="col-md-2 control-label">Prix</label>
                      <div class="col-md-10">
                        <input id="prixCustom" type="number" pattern="[0-9]+([\.|,][0-9]+)?" step="0.01" class="form-control" placeholder="Entrez un prix">
                      </div>
                    </div>
                    <div class="form-group">
                      <label class="col-md-2 control-label">Cat&eacutegorie</label>
                      <div class="input-group col-md-3">
                        <input id="categCustom" type="text" class="form-control" placeholder="Selectionner une categorie" readonly>
                        <div class="input-group-btn">
                          <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                            <span class="caret"></span>
                          </button>
                          <ul id="categCustomDropdown" class="dropdown-menu">
                          """

categOption = """           <li><a href="#">%s</a></li>"""

for i in range(len(allCateg)) :
	print categOption % allCateg[i][1]

print """
                          </ul>
                        </div>
                        <script type="text/javascript">
                          $("#categCustomDropdown a").on('click', function(){
                            $("#categCustom").val($(this).text());
                            $("#categCustom").trigger('change');
                          });
                        </script>
                      </div>
                    </div>
                  </form>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-default" data-dismiss="modal">Annuler</button>
                  <button id="confirmCustom" type="button" class="btn btn-primary disabled">Confirmer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="tab-pane fade" id="commentaire">
        <form id="clientForm" role="form" class="form-horizontal">
          <div class="form-group">
            <label for="commentaireCommande" class="col-md-2 control-label">Commentaire</label>
            <div class="input-group col-md-6">
              <textarea class="typeahead form-control" id="comcom" rows="10" placeholder="Commentaire général"></textarea>
            </div>
          </div>
        </form>
      </div>
      <div class="fill tab-pane fade" id="payement" style="height:90%;">
        <form id="clientForm" role="form" class="fill form-horizontal" style="height:100%;">
          <div class="form-group">
            <label class="col-md-2 control-label">Prix total</label>
            <div class="col-md-6">
              <input id="prix2" type="text" class="form-control prixTot" value="0 EUR" disabled>
            </div>
          </div>
          <div class="fill form-group" style="height:100%;">
            <div class="fill col-md-12" style="height:100%;">
              <div class="fill col-md-6" style="height:80%;">
                <button type="" id="payeCommande" class="fill btn btn-primary btn-block" style="height:100%;">Pay&eacute</button>
              </div>
              <div class="col-md-6" style="height:80%;">
                <button type="" id="payeReception" class="fill btn btn-primary btn-block" style="height:100%;">Non pay&eacute</button>
              </div>
              <div class="col-md-12" style="height:20%; margin-top:10px;">
                <button type="" id="payeFacture" class="fill btn btn-primary btn-block" style="height:100%;">&Agrave facturer</button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div class="tab-pane fade" id="recapitulatif">
        <div id="toPrint">
          <form class="form-horizontal" role="form">
            <div class="form-group">
              <label class="col-md-2 control-label">Nom</label>
              <div class="col-md-6">
                <p id="recapNom" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">T&eacutel&eacutephone</label>
              <div class="col-md-6">
                <p id="recapTel" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Mail</label>
              <div class="col-md-6">
                <p id="recapMail" class="form-control-static">Aucune</p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">TVA</label>
              <div class="col-md-6">
                <p id="recapTVA" class="form-control-static">Aucune</p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Date</label>
              <div class="col-md-6">
                <p id="recapDate" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Heure</label>
              <div class="col-md-6">
                <p id="recapHeure" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Produits</label>
              <div class="col-md-6">
                <table class="table form-control-static">
                  <thead>
                    <th>Nom</th>
                    <th>Prix unitaire</th>
                    <th>Quantit&eacute</th>
                    <th>Total</th>
                  </thead>
                  <tbody id="recapProduit">
                
                  </tbody>
                </table>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Total</label>
              <div class="col-md-6">
                <p id="recapTotal" class="form-control-static prixTotP"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Commentaire</label>
              <div class="col-md-6">
                <p id="recapCommentaire" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Payement</label>
              <div class="col-md-6">
                <p id="recapPayement" class="form-control-static"></p>
              </div>
            </div>
            <div class="form-group">
              <label class="col-md-2 control-label">Vendeuse</label>
              <div class="col-md-6">
                <p id="recapVendeuse" class="form-control-static"></p>
              </div>
            </div>
          
          </form>
        </div>
        <button id="doPrint" class="btn btn-lg btn-primary">Imprimer</button>
      </div>
    </div>

    <div class="navbar navbar-fixed-bottom">
      <div class="col-md-2 col-md-offset-1">
        <button type="button" class="btn btn-danger btn-lg btn-block" id="retour">Retour</button>
      </div>
      <div class="col-md-2 col-md-offset-6">
        <button type="button" class="btn btn-success btn-lg btn-block disabled" id="suivant">Suivant</button>
      </div>
    </div>

    <div class="col-md-offset-5 col-md-7 navbar navbar-fixed-top text-right div-absolu">
      <label id="entete"><h3><font class="enteteDate" color="red"></font> - <font id="enteteNom"></font></h3></label>
    </div>
  <!-- FIN APPLICATION COMMANDE -->
  </div>

  <div class="modal fade" id="popupResult">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <p id="popupcontent" class="text-center">
            <img src="/image/loadingBar.gif" class="center-block">
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Fermer</button>
        </div>
      </div>
    </div>

    <div rel="popover" data-animation="false" data-easein="bounceInRight" data-placement="right" id="pouce" style="position:absolute !important; right:0px !important; bottom:25% !important;" hidden>
      <img src="/image/pouce.png">
    </div>
  </div>
  <div class="modal fade" id="dateValidation">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-body">
          <p class="text-center">
            Vous avez s&eacutelectionn&eacute :
          </p>
          <h1 class="enteteDate" style="text-align:center !important;"></h1>
        </div>
        <div class="modal-footer">
          <div class="col-md-4">
            <button id="dateCancel" type="button" class="btn btn-lg btn-block btn-danger" data-dismiss="modal">Non</button>
          </div>
          <div class="col-md-offset-4 col-md-4">
            <button type="button" id="dateOK" class="btn btn-lg btn-block btn-success" data-dismiss="modal">Oui</button>
          </div>
        </div>
      </div>
    </div>
  </div>
"""
isActive = 1
if sess.data.get('idTerminal') :
	db.execute("""SELECT Terminal.Actif FROM Terminal WHERE Terminal.idTerminal='%s'""" % sess.data.get('idTerminal'))
	isActive = db.fetchone()[0]
if (not sess.data.get('idTerminal')) or (not isActive) :
	print"""
    <div class="modal fade" id="popupSess" data-backdrop="static" keyboard="false">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title">Param&egravetres de session</h4>
          </div>
          <div class="modal-body">
            <ul class="nav nav-pills" role="tablist">
	"""

	tabMagasin = """
              <li>
                <a href="#magasin%s" role="tab" data-toggle="tab" data-idmagasin="%s">%s</a>
              </li>
	"""
	terminalBtn = """
	<label class="btn btn-lg btn-primary">
		<input type="radio" value="%s"> %s
	</label>
	"""

	db.execute("SELECT Magasin.idMagasin, Magasin.Nom FROM Magasin;")
	allMag = sorted(db.fetchall(), key=lambda tup: tup[0])
    
	for i in range(len(allMag)) :
		print tabMagasin % (allMag[i][0], allMag[i][0], allMag[i][1])

	print """
            </ul>
            <!-- Tab panes -->
            <div class="tab-content" id="tabSess">
	"""

	for k in range(len(allMag)) :
		print """
            <div class="tab-pane" id="magasin%s">
	      <label>S&eacutelectionnez le terminal actuel</label>
              <div data-toggle="buttons">
		""" % allMag[k][0]

		db.execute("""SELECT Terminal.idTerminal FROM Terminal 
		WHERE Terminal.Magasin_idMagasin='%s' AND Terminal.Actif=1""" % allMag[k][0])

		allTerminal = sorted(db.fetchall(), key=lambda tup: tup[0])

		for i in range(len(allTerminal)) :
			print terminalBtn % (allTerminal[i][0], i)

		print """
	      </div>
	    </div>
		"""

	print """
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default disabled" data-dismiss="modal" id="closeModalSess">Fermer</button>
          </div>
        </div>
      </div>
    </div>
    <script type="text/javascript">
      $('#popupSess').modal('show');
      $('#tabSess label').each(function(){
          $(this).on('click', function(){
            $('#closeModalSess').removeClass('disabled');
        });
      });
    </script>
	"""

print """
    <script type="text/javascript">
      $(document).ready(function() {
        $('#dateLivraison').datepicker({
          format: "yyyy-mm-dd",
          startDate: new Date(),
          clearBtn: true,
          autoclose: true
        });
        $('#dateConsultation').datepicker({
          format: "yyyy-mm-dd",
          clearBtn: true,
          autoclose: true
        });
      });
    </script>

    <script id="listCommande" type="text/x-handlebars-template">
      <tr id="dataCom{{idCommande}}" data-toggle="collapse" data-target="#tr{{idCommande}}" data-remarque="{{Remarque}}" data-telclient="{{TelClient}}" data-mailclient="{{MailClient}}" data-tvaclient="{{TVAClient}}" data-idclient="{{idClient}}" data-date="{{Date}}" 
data-heure="{{Heure}}">
        <td>
          {{Livraison}}
        </td>
        <td>
          {{NomClient}}
        </td>
        <td>
          {{TelClient}}
        </td>
        <td>
          {{Remarque}}
        </td>
        <td>
          {{PNP}}
        </td>
        <td>
          {{Montant}}
        </td>
        <td>
          {{NomVendeuse}}
        </td>
        <td>
          <button type="button" class="btn btn-block btn-primary modifierConsultation" data-idCommande="{{idCommande}}">Modifier</button>
        </td>
        <td>
          <button type="button" class="btn btn-block btn-danger supprimerConsultation" data-idCommande="{{idCommande}}" data-toggle="modal" data-target="#popupSupprimerConsultation">Supprimer</button>
        </td>
      </tr>
      <tr id="tr{{idCommande}}" class="collapse">
        <td colspan="6">
          <table class="table col-md-12" style="background-color: whitesmoke;">
            <tbody id="tbody{{idCommande}}">
              {{htmlProduits}}
            </tbody>
          </table>
        </td>
      </tr>
    </script>

    <script id="listProduitCommande" type="text/x-handlebars-template">
      <tr data-custom="{{Custom}}" data-prix="{{Prix}}" data-idProduit="{{idProduit}}" data-categorie="{{Categorie}}">
        <td class="col-md-2">
          {{Nom}}
        </td>
        <td class="col-md-1">
          {{Quantite}}
        </td>
        <td class="col-md-9">
          {{Details}}
        </td>
      </tr>
    </script>

    <script id="produitEntry" type="text/x-handlebars-template">
      <li class="list-group-item" data-idProduit="{{produitID}}">
        <form class="form-horizontal" role="form">
          <div class="form-group">
            <label class="control-label col-md-7" data-toggle="modal" data-target="#popupProduit{{entryID}}">{{produitNom}}</label>
            <div class="input-group col-md-5">
              <span class="input-group-addon glyphicon glyphicon-minus"></span>
              <input id="inputQuantiteProduit{{entryID}}" type="number" class="form-control" value="1" data-nom="{{produitNom}}" data-prix="{{produitPrix}}" data-idProduit="{{produitID}}" data-custom="{{custom}}" data-categcustom="{{categCustom}}">
              <span class="input-group-addon glyphicon glyphicon-plus"></span>
              <span class="input-group-addon glyphicon glyphicon-remove clearInput" data-idProduit="{{produitID}}"></span>
            </div>
            <div class="modal fade" id="popupProduit{{entryID}}" data-backdrop="static" keyboard="false">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <button type="button" class="close clearComm" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>
                    <h4 class="modal-title">Commentaire sur {{produitNom}}</h4>
                  </div>
                  <div class="modal-body">
                    <textarea class="form-control inputComm" rows="3" placeholder="Entrez votre commentaire"></textarea>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-default clearComm" data-dismiss="modal">Annuler</button>
                    <button type="button" class="btn btn-primary saveComm disabled" data-dismiss="modal">Sauver</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </li>
    </script>
    <script id="produitEntryRecap" type="text/x-handlebars-template">
      <tr>
        <td>{{produitNom}}</td><td>{{produitPrix}}</td><td>1</td><td>{{produitPrix}}</td>
      </tr>
    </script>
    <script src="/commande_main.js"></script>
  </body>
</html>
"""
