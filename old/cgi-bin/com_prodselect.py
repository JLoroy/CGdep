#!/usr/bin/env python


import cgi
import cgitb
import session, time
from utils import fieldStorageToDict
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])


cgitb.enable()
sess = session.Session(expires=24*60*60, cookie_path='/')
params = fieldStorageToDict(cgi.FieldStorage())

sess.data['commande'] = sess.data.get('commande') + ';' + params['produit']
