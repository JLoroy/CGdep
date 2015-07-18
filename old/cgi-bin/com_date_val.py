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
params.update({'date' : sess.data.get('date')})

print "Content-Type: text/html\n"

if params.has_key("heure") :
	val = params["heure"]
	if (val == "07h") :
		sess.data['heure'] = "07:00:00"
	elif (val =="10h") : 
		sess.data['heure'] = "10:00:00"
	elif (val =="14h") :
		sess.data['heure'] = "14:00:00"
	else :
		sess.data['heure'] = "12:00:00"

	params.update({'error' : ''})
	print open("/var/www/cgi-bin/com_date_val.html", "r").read() % params
else :
	params.update({'error' : "Veuillez entrer une heure"})
	print open("/var/www/cgi-bin/com_heure.html", "r").read() % params







