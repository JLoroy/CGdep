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

if params.has_key("date") :
	sess.data['date'] = params["date"]
	params.update({'error' : ''})
	print open("/var/www/cgi-bin/com_heure.html", "r").read() % params
else :
	params.update({'error' : "Veuillez entrer une date"})
	print open("/var/www/cgi-bin/com_date.html", "r").read() % params
