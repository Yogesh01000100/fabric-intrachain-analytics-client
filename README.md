# Dependencies:
- Node.js
- Docker and Docker Compose
- Python
- Git

## Docker steps:

```bash
sudo apt-get update
```
```bash
sudo apt install docker.io
```
```bash
newgrp docker
```
```bash  
sudo usermod -aG docker $USER    # (restart the PC after this step)
```
```bash
sudo systemctl enable docker
```
```bash
sudo systemctl start docker
```
```bash
sudo systemctl status docker
```
```bash
sudo apt install docker-compose
```
## Network Creation steps:
```bash
./install-fabric.sh b
```
```bash
./create-network.sh
```
```bash
sudo systemctl start ipfs-node.service  # (start the ipfs node)
```
