#!/usr/bin/env python

import cgi
import cgitb
import session, time, datetime
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
sess = session.Session(expires=24*60*60, cookie_path='/')
print sess.cookie
error = False
try :
	if not sess.data.get('client') == "" :
		pass
except :
	error = True
	print "Content-Type: text/html\n"
	print open("/var/www/cgi-bin/com_error.html", "r").read() % "Choix du client"

if not error :
	tomorrow = datetime.date.today() + datetime.timedelta(days=1)
	#zfill : definir une largeur et rempli de 0 pour atteindre la largeur
	strTomorrow = str(tomorrow.month).zfill(2)+"/"+str(tomorrow.day).zfill(2)+"/"+str(tomorrow.year)
	params = {'error' : '', 'defaultDate' : strTomorrow}
	print "Content-Type: text/html\n"
	print open("/var/www/cgi-bin/com_date.html", "r").read() % params
