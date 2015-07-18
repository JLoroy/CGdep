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

qTmp = params["query"]

if not qTmp[-1] == " " :
	q = qTmp.split(" ")

	db.execute("""SELECT MotCustom.Mot FROM MotCustom WHERE MotCustom.Mot LIKE '%s%%' LIMIT 0,10;""" % q[-1])

	data = db.fetchall()

	for item in data :
		print item[0] + "|"
