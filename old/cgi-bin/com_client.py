#!/usr/bin/env python

import cgi
import cgitb
import session, time
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()

sess = session.Session(expires=24*60*60, cookie_path='/')
print sess.cookie

params = {'error' : '', 'client' : 'Nom du client', 'clientTel' : '', 'clientMail' : ''}
print "Content-Type: text/html\n"
print open("/var/www/cgi-bin/com_client.html", "r").read() % params
