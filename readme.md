Dependencies: 

Node.js
Docker and Docker Compose
Python
Git

Docker steps:

sudo apt-get update
sudo apt install docker.io
docker -v (check the version)
newgrp docker
sudo usermod -aG docker $USER (restart the PC after this step)
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker (exit)

sudo apt install docker-compose
docker-compose -v

Run the code

# 1:->    ./install-fabric.sh b
# 2:->    ./create-network.sh


Final step:
disable firewall access: (if issues occur) sudo ufw disable

Network details:

database: http://localhost:5984/_utils/

environment:
  - COUCHDB_USER=admin
  - COUCHDB_PASSWORD=adminpw
  
Testing: 
./tape-Linux-X64 commitOnly --config=config.yaml --number=1000 for blockchain testing
