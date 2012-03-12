Post code finder application
----------------------------

This is a weekend project that finds zip codes of locations in Turkey. It is source code of [www.postazipkodu.com](http://www.postazipkodu.com). It is based on the post code list that I found on this address https://interaktifkargo.ptt.gov.tr/posta_kodu/pk.zip . 

From the tecnical aspect, this is a static one page web application that downloads zip code data files as it needed. There is no server side tecnology involed. On the client side Jquery, Bootstrap, Underscore, Backbone libraries used.

Installation
------------
Normally copying files to web server root directory would be enough. But to save from space I did not add data files to source code. So you need to create data files using included script.

* https://interaktifkargo.ptt.gov.tr/posta_kodu/pk.zip download this file.
* there will be a spread-sheet file inside. open it and save it as csv. Then remove header.(first line). At this point you should have a csv file that has city,township,district,providence,zip code information in every line.
name csv file as pk.csv and put it in your root directory. In my case first line of csv file was 
>ADANA,ALADAĞ(KARSANTI),AKÖREN,CİVANBEY MAH.,1720
* create a directory named pkinfo in project directory.
* call `python generatefiles.py` to generate data files.
* At this point you should have your data files generated in pkinfo directory. And you should use application by running index.html. 