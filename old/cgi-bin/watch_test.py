#!/usr/bin/env python

import cgi
import cgitb
import MySQLdb as mysqldb
import session, time
from utils import fieldStorageToDict, idgen
import time
import sys, os
sys.path.append(os.environ["PATH_TRANSLATED"])

cgitb.enable()
params = fieldStorageToDict(cgi.FieldStorage())
