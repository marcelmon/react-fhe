pip3 install pyspark --user
export PYSPARK_PYTHON=python3

pip3 install pybind11 --user
ln -s example*.so example.so

pip3 install pyspark --upgrade --user

git clone https://git.njit.edu/palisade/PALISADE.git
pushd PALISADE
make bin/lib/libPALISADEcore.so bin/lib/libPALISADEpke.so
popd
ln -s PALISADE/bin/lib/libPALISADEcore.so ./
ln -s PALISADE/bin/lib/libPALISADEpke.so ./

make

## Mini-demo

#### Bootstrap the "database" with a few words. Pretend a "client" creates a cryptocontext, public key, and secret key, then uses them to encrypt some words and give them to the "server" to store. A unique directory is created, here c07, with client and server halves as subdirs.
python app_bootstrap.py 3

#### Acting as a client, use the cryptocontext and public key to construct a query: a word to check the existence of at the server, sent encrypted.
python app_client.py c07 a
#### Submit the job to the server, passing the query/encrypted word, public key, and cryptocontext
spark-submit --files ./c07/client/key.pub,./c07/client/cryptocontext.cc,./c07/client/query.enc app_server.py
#### The server writes the encrypted result at `./c07/client/result.enc`. Decrypt the result to see if the result is True (word exists at server) or False (doesn't).
python app_client_result.py c07
```
$ python app_client.py c07 a
$ spark-submit --files ./c07/client/key.pub,./c07/client/cryptocontext.cc,./c07/client/query.enc app_server.py
$ python app_client_result.py c07
True
$ python app_client.py c07 b
$ spark-submit --files ./c07/client/key.pub,./c07/client/cryptocontext.cc,./c07/client/query.enc app_server.py
$ python app_client_result.py c07
False
```

## Example full command
spark-2.3.0-bin-hadoop2.7/bin/spark-submit --master=spark://skylake:7077 --py-files ./example.so,./libPALISADEcore.so,./libPALISADEpke.so --files ./c07/client/key.pub,./c07/client/cryptocontext.cc,./c07/client/query.enc app_server.py

## Example w/ Cassandra (need spark 2.2)
CASSANDRA=true python app_bootstrap.py 3
CASSANDRA=true spark-submit --packages com.datastax.spark:spark-cassandra-connector_2.11:2.0.7 --py-files ./example.so,./libPALISADEcore.so,./libPALISADEpke.so --files ./084/client/key.pub,./084/client/cryptocontext.cc,./084/client/query.enc app_server.py


## Example w/ Postgres (need spark 2.2)
POSTGRES=true python app_bootstrap.py 3
POSTGRES=true spark-submit --jars postgresql-42.1.4.jar --driver-class-path=postgresql-42.1.4.jar --py-files ./example.so,./libPALISADEcore.so,./libPALISADEpke.so --files ./084/client/key.pub,./084/client/cryptocontext.cc,./084/client/query.enc app_server.py

# OLD
sudo dnf install postgresql-server postgresql-contrib
sudo postgresql-setup --initdb --unit postgresql
sudo systemctl start postgresql
sudo su - postgres
psql
\q
createuser matthew -P
createdb --owner=matthew mydb
sudo sed -i 's,host    all             all             127.0.0.1/32            ident,host    all             all             127.0.0.1/32            md5,' /var/lib/pgsql/data/pg_hba.conf
sudo sed -i 's,host    all             all             ::1/128                 ident,host    all             all             ::1/128                 md5,' /var/lib/pgsql/data/pg_hba.conf
sudo systemctl restart postgresql
psql -h localhost -U matthew mydb
CREATE TABLE public.binaries ("name" TEXT , "value" BYTEA );
\q
###### ref: https://fedoramagazine.org/postgresql-quick-start-fedora-24/

time spark-submit --driver-class-path=postgresql-42.1.4.jar app.py Alice Bob

./sbin/start-master.sh
./sbin/start-slave.sh  spark://eb:7077 -c 4
time spark-submit --master spark://eb:7077 --jars postgresql-42.1.4.jar --driver-class-path=postgresql-42.1.4.jar app.py Alice Bob

psql -h localhost -U matthew mydb
SELECT name, left(encode(value, 'hex'), 32) FROM BINARIES;
\q

pushd PALISADE
g++ -std=gnu++11 -fPIC -g -Wall -Werror -O3 -fopenmp -pthread -I src/core/lib -I src/pke/lib -I src/trapdoor/lib -I src/circuit/lib -I test -I third-party/include -I third-party/include -c -o src/pke/bin/demo/demo-pke.o src/pke/demo/demo-pke.cpp
g++ -std=gnu++11 -fPIC -o bin/demo/pke/demo-pke src/pke/bin/demo/demo-pke.o bin/lib/libPALISADEpke.so bin/lib/libPALISADEcore.so -Lbin/lib   -pthread -fopenmp   -lgomp
LD_LIBRARY_PATH=bin/lib bin/demo/pke/demo-pke
popd

https://cassandra.apache.org/download/
service cassandra start
cqlsh localhost
CREATE KEYSPACE test WITH REPLICATION = { 'class' : 'NetworkTopologyStrategy', 'datacenter1' : 1 }; # 1 replica in datacenter1
CREATE TABLE test.kv (name text PRIMARY KEY, value blob);
BOOTSTRAP=true spark-submit  --packages com.datastax.spark:spark-cassandra-connector_2.11:2.0.6 app_cassandra.py
spark-submit  --packages com.datastax.spark:spark-cassandra-connector_2.11:2.0.6 app_cassandra.py

spark-submit app_bootstrap.py 10
cp ./c314b29376403fab2f2224b4a7350248c3704cdb/a.enc ./query.enc && spark-submit --files ./c314b29376403fab2f2224b4a7350248c3704cdb/key.pub,./c314b29376403fab2f2224b4a7350248c3704cdb/cryptocontext.cc,./query.enc app_server.py
