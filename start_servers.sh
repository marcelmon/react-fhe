ps -ef | grep node_index| grep -v grep | awk '{print $2}' | xargs kill -INT
ps -ef | grep fhe_server| grep -v grep | awk '{print $2}' | xargs kill -INT
sleep 1
sudo fuser -k 8081/tcp
sudo fuser -k 8082/tcp
cd node-server-app
nohup node app.js > ../app.out 2> ../app.err &
cd ../fhe/shield_spark
pwd
nohup python3 -u fhe_server.py > ../fhe_server.out 2> ../fhe_server.err &
sleep 1
