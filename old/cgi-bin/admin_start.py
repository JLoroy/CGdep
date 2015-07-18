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
print """
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <script src="/jquery.js"></script>
    <script src="/bootstrap/js/bootstrap.js"></script>
    <script src="/bootstrap/js/bootstrap-datepicker.js"></script>
    <script src="/bootstrap/js/typeahead.js"></script>
    <script src="/bootstrap/js/handlebars.js"></script>
    <link href="/bootstrap/css/bootstrap.css" rel="stylesheet" />
    <link href="/bootstrap/css/datepicker.css" rel="stylesheet" />
    <link href="/bootstrap/css/typeahead.css" rel="stylesheet" />
    <link href="/cgcss.css" rel="stylesheet" />
    <title>Panneau d'administration</title>
  </head>
  <body>
    <!-- Nav tabs -->
    <ul id="mainTab" class="nav nav-tabs" role="tablist">
      <li class="active"><a href="#commande" role="tab" data-toggle="tab">Commandes</a></li>
      <li><a href="#client" role="tab" data-toggle="tab">Clients</a></li>
      <li><a href="#produit" role="tab" data-toggle="tab">Produits</a></li>
      <li><a href="#categorie" role="tab" data-toggle="tab">Categories</a></li>
      <li><a href="#magasin" role="tab" data-toggle="tab">Magasins</a></li>
      <li><a href="#personnel" role="tab" data-toggle="tab">Personnel</a></li>
      <li><a href="#terminal" role="tab" data-toggle="tab">Terminaux</a></li>
      <li><a href="#ferie" role="tab" data-toggle="tab">Ferie</a></li>
    </ul>

    <!-- Tab panes -->
    <div class="tab-content">
      <div class="tab-pane active" id="commande">
        <div class="row">
          <div id="selectorMagasin" class="col-md-12 form-inline" data-toggle="buttons">"""

checkButton = """
            <label class="btn btn-primary active" data-value="%s">
              <input class="form-control" type="checkbox" checked> %s
            </label>
"""

db.execute("SELECT Magasin.idMagasin, Magasin.Nom FROM Magasin")

allMagasin = sorted(db.fetchall(), key=lambda tup: tup[0])

for i in range(len(allMagasin)) :
	print checkButton % (allMagasin[i][0], allMagasin[i][1])

print """
          </div>
        </div>
        </br>
        <div class="row">
          <div class="form-inline col-md-12">
            <div class="form-group col-md-4">
              <label class="col-md-4">
                Cr&eacuteation
              </label>
              <div class="input-group col-md-8">
                <input id="dpCreate" type="text" placeholder="Entrez une date" class="form-control">
                <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
              </div>
            </div>
            <div class="form-group col-md-4">
              <label class="col-md-4">
                R&eacuteception
              </label>
              <div class="input-group col-md-8">
                <input id="dpLivraison" type="text" placeholder="Entrez une date" class="form-control">
                <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
              </div>
            </div>
            <div class="form-group col-md-4">
              <label class="col-md-4">
                # R&eacutesultats
              </label>
              <div class="input-group col-md-8">
                <input id="nbrResult" type="number" placeholder="Entrez un nombre" class="form-control">
                <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
              </div>
            </div>
          </div>
        </div>
        <div class="mainContentCommandes col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="client">
        <div class="form-horizontal col-md-8 col-md-offset-2">
          <div class="form-group">
            <label class="control-label col-md-4">Nom du client</label>
            <div class="col-md-8">
              <input id="ACclient" type="text" class="typeahead form-control">
            </div>
          </div>
        </div>
        <div class="mainContentClients col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="produit">
        <div class="form-horizontal col-md-8 col-md-offset-2">
          <div class="form-group">
            <label class="control-label col-md-4">Nom du produit</label>
            <div class="col-md-8">
              <input id="ACproduit" type="text" class="typeahead form-control">
            </div>
          </div>
        </div>
        <div class="mainContentProduits col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="categorie">
        <div class="mainContentCategories col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="magasin">
        <div class="mainContentMagasins col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="personnel">
        <div class="mainContentPersonnel col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="terminal">
        <div class="mainContentTerminaux col-md-12">
        </div>
      </div>
      <div class="tab-pane" id="ferie">
        <form role="form" class="form-horizontal col-md-5">
          <div class="form-group">
            <label class="col-md-3 control-label">Jour f&eacuteri&eacute</label>
            <div class="col-md-9">
              <div class="input-group col-md-8">
                <input id="dpFerie" type="text" placeholder="Entrez une date" class="form-control">
                <span class="input-group-addon glyphicon glyphicon-remove clearInput"></span>
              </div>
            </div>
          </div>
        </form>
        <div class="col-md-1">
          <button id="addFerie" class="btn btn-success btn-block disabled">Ajouter</button>
        </div>
        <div class="mainContentFerie col-md-12">
        </div>
      </div>
    </div>
    <script type="text/javascript">
      $(document).ready(function() {
        $('#dpCreate').datepicker({
          format: "yyyy-mm-dd",
          clearBtn: true,
          autoclose: true
        });
        $('#dpLivraison').datepicker({
          format: "yyyy-mm-dd",
          clearBtn: true,
          autoclose: true
        });
        $('#dpFerie').datepicker({
          format: "yyyy-mm-dd",
          clearBtn: true,
          autoclose: true
        });
      });
    </script>
    <script src="/admin_main.js"></script>
  </body>
</html>
"""
