def idgen():
	IDgen = open("/var/www/cgi-bin/currID.txt", "a+")
	ID = int(IDgen.readline())
	IDgen.seek(0,0)
	IDgen.truncate()
	IDgen.write(str(ID+1))
	IDgen.close()
	return ID
