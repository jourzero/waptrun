CREATE USER 'tester'@'localhost' IDENTIFIED BY 'Passw0rd123';
GRANT ALL PRIVILEGES ON * . * TO 'tester'@'localhost';
FLUSH PRIVILEGES;
