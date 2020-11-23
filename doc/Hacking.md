# Hacking Tools

## sqlite3

```bash
/# apt-get update

/# apt-get install sqlite3

/# which sqlite3
/usr/bin/sqlite3

/# cd /app/doc/hacking/

/app/doc/hacking# sqlite3 chinook.db

sqlite> .tables
albums          employees       invoices        playlists
artists         genres          media_types     tracks
customers       invoice_items   playlist_track

sqlite> select FirstName,LastName from employees where FirstName = "Andrew" union select "a","b";
Andrew|Adams
a|b
```

## mysql

```bash
host$ docker exec -it dvna_mysql-db_1 /usr/bin/mysql dvna -u dvna -p
Enter password: passw0rd
Welcome to the MySQL monitor.  Commands end with ; or \g.
Your MySQL connection id is 31
Server version: 5.7.32 MySQL Community Server (GPL)

mysql> select version(), user(), now(), database();
+-----------+----------------+---------------------+------------+
| version() | user()         | now()               | database() |
+-----------+----------------+---------------------+------------+
| 5.7.32    | dvna@localhost | 2020-11-18 05:01:43 | dvna       |
+-----------+----------------+---------------------+------------+

mysql> show tables;
+----------------+
| Tables_in_dvna |
+----------------+
| Products       |
| Users          |
+----------------+

mysql> select table_schema,table_name from information_schema.tables;
+--------------------+---------------------------------------+
| table_schema       | table_name                            |
+--------------------+---------------------------------------+
| information_schema | CHARACTER_SETS                        |
#[...]
| information_schema | TABLES                                |
#[...]
| information_schema | USER_PRIVILEGES                       |
#[...]
| information_schema | INNODB_SYS_COLUMNS                    |
| information_schema | INNODB_SYS_FOREIGN                    |
| information_schema | INNODB_SYS_TABLESTATS                 |
| dvna               | Products                              |
| dvna               | Users                                 |
+--------------------+---------------------------------------+


mysql> show columns from dvna.Users;
+-----------+--------------+------+-----+---------+----------------+
| Field     | Type         | Null | Key | Default | Extra          |
+-----------+--------------+------+-----+---------+----------------+
| id        | int(11)      | NO   | PRI | NULL    | auto_increment |
| name      | varchar(255) | NO   |     | NULL    |                |
| login     | varchar(255) | NO   | UNI | NULL    |                |
| email     | varchar(255) | NO   |     | NULL    |                |
| password  | varchar(255) | NO   |     | NULL    |                |
| role      | varchar(255) | YES  |     | NULL    |                |
| createdAt | datetime     | NO   |     | NULL    |                |
| updatedAt | datetime     | NO   |     | NULL    |                |
+-----------+--------------+------+-----+---------+----------------+

mysql> select name,login,password from Users;
+--------+---------+--------------------------------------------------------------+
| name   | login   | password                                                     |
+--------+---------+--------------------------------------------------------------+
| John P | jpeters | $2a$10$qhWhPICqQLXsreROchGMmehCF5pkFR8cniORZSnbGqWyKxFx/ySZS |
+--------+---------+--------------------------------------------------------------+

mysql> select name,login from Users where login='jpeters' and 'a'='b' union select user(),now() from Users where 'a'='a';
+----------------+---------------------+
| name           | login               |
+----------------+---------------------+
| dvna@localhost | 2020-11-18 05:15:15 |
+----------------+---------------------+

mysql> exit
Bye
host$
```
