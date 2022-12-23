#!/bin/bash

# give permission to the files inside /secure_docs directory

sudo chmod -R 777 /home/ubuntu/trackwyse-backend-node

# navigate into current working directory

cd /home/ubuntu/trackwyse-backend-node

# install node modules

yarn install

# build the project

yarn build

# start our node app in the background using pm2

sudo pm2 start --name "trackwyse-backend-node" npm -- start