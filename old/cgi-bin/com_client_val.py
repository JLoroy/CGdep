#!/usr/bin/env python

import cgi
import cgitb
import session, time
from utils import fieldStorageToDict
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
sess = session.Session(expires=24*60*60, cookie_path='/')
print sess.cookie
params = fieldStorageToDict(cgi.FieldStorage())

print "Content-Type: text/html\n"

error = False

if params.has_key("client") :
	if params["client"] == "Nom du client" :
		params.update({'error' : "Veuillez entrer un nom"})
		error = True
	else :
		sess.data['client'] = params["client"]
else :
	params.update({'error' : "Veuillez entrer un nom"})
	params['client'] = "Nom du client"
	error = True

if params.has_key("clientTel") :
	sess.data['clientTel'] = params["clientTel"]
else :
	if error :
		params.update({'error' : params['error']+ "<br/>Veuillez entrer un num&eacute;ro de t&eacute;l&eacute;phone"})
	else :
		params.update({'error' : "Veuillez entrer un num&eacute;ro de t&eacute;l&eacute;phone"})
		error = True

if params.has_key("clientMail") :
	sess.data['clientMail'] = params["clientMail"]
else :
	sess.data['clientMail'] = ""
	params['clientMail'] = ""

if error :
	print open("/var/www/cgi-bin/com_client.html", "r").read() % params
else :
	print open("/var/www/cgi-bin/com_client_val.html", "r").read() % params
