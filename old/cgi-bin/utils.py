#!/usr/bin/env python

import cgi

def fieldStorageToDict (fieldStorage) :
	params = {}
	for key in fieldStorage.keys() :
		params[key] = fieldStorage[key].value
	return params

def idgen(table):
	IDgen = open("/var/www/cgi-bin/%scurrID.txt" % (table), "a+")
	ID = int(IDgen.readline())
	IDgen.seek(0,0)
	IDgen.truncate()
	IDgen.write(str(ID+1))
	IDgen.close()
	return ID
