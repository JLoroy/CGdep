#!/bin/bash

cd /home/CGadmin/cgi-bin
for f in *
do 
   cp $f /var/www/cgi-bin/$f
done

exit 0
