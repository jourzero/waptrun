# TODO


In addition to the TODO notes in README.md, here are some notes to help later...

## Importing the MongoDB data from previous export

``` bash
$ mv ~/Downloads/waptrun-mongodb-export.tgz /tmp/backup

$ cd /tmp/backup

$ tar xvfz waptrun-mongodb-export.tgz 
x waptrunner/
x waptrunner/issues.bson
x waptrunner/objectlabs-system.admin.collections.bson
x waptrunner/objectlabs-system.metadata.json
x waptrunner/objectlabs-system.bson
x waptrunner/localUsers.metadata.json
x waptrunner/testkb.bson
x waptrunner/localUsers.bson
x waptrunner/project.bson
x waptrunner/cwe.metadata.json
x waptrunner/sessions.bson
x waptrunner/project.metadata.json
x waptrunner/sessions.metadata.json
x waptrunner/issues.metadata.json
x waptrunner/users.metadata.json
x waptrunner/testkb.metadata.json
x waptrunner/cwe.bson
x waptrunner/objectlabs-system.admin.collections.metadata.json
x waptrunner/users.bson


$ docker-compose down
Stopping waptr   ... done
Stopping waptrdb ... done
Removing waptr   ... done
Removing waptrdb ... done
Removing network waptrun_default

$ docker-compose up -d
Creating network "waptrun_default" with the default driver
Creating waptrdb ... done
Creating waptr   ... done

$ docker exec waptrdb ls /backup
waptrun-mongodb-export.tgz
waptrunner

$ docker exec waptrdb mongorestore --db=waptrunner /backup/waptrunner --drop --host 127.0.0.1:27017
2019-02-18T17:04:02.118+0000	the --db and --collection args should only be used when restoring from a BSON file. Other uses are deprecated and will not exist in the future; use --nsInclude instead
2019-02-18T17:04:02.120+0000	building a list of collections to restore from /backup/waptrunner dir
2019-02-18T17:04:02.141+0000	reading metadata for waptrunner.issues from /backup/waptrunner/issues.metadata.json
2019-02-18T17:04:02.141+0000	reading metadata for waptrunner.cwe from /backup/waptrunner/cwe.metadata.json
2019-02-18T17:04:02.142+0000	reading metadata for waptrunner.testkb from /backup/waptrunner/testkb.metadata.json
2019-02-18T17:04:02.143+0000	reading metadata for waptrunner.project from /backup/waptrunner/project.metadata.json
2019-02-18T17:04:02.158+0000	restoring waptrunner.issues from /backup/waptrunner/issues.bson
2019-02-18T17:04:02.178+0000	restoring waptrunner.cwe from /backup/waptrunner/cwe.bson
[...]
2019-02-18T17:04:02.473+0000	done
```
