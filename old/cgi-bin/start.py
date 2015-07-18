#!/usr/bin/env python

import cgi
import cgitb

cgitb.enable()
params = {"Nom":"", "Categorie":"", "Prix":""}
print "Content-Type: text/html\n"
print open("/var/www/cgi-bin/addProduit.html", "r").read() % params
