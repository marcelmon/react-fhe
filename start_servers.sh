ps -ef | grep node_index| grep -v grep | awk '{print $2}' | xargs kill -INT
ps -ef | grep fhe_server| grep -v grep | awk '{print $2}' | xargs kill -INT
sleep 1
sudo fuser -k 8081/tcp
sudo fuser -k 8082/tcp
cd node-server-app
nohup node new_node_index.js > /var/www/html/FHSearch/new_node_index.out 2> /var/www/html/FHSearch/new_node_index.err &
cd ../fhe/shield_spark
pwd
nohup python3 -u fhe_server.py > /var/www/html/FHSearch/fhe_server.out 2> /var/www/html/FHSearch/fhe_server.err &
sleep 1
