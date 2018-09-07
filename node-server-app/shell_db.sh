mysql -u root -p'' -e"drop database if exists fhe_test; create database fhe_test;";
mysql -u root -p'' fhe_test < ./user_data_database.sql;
