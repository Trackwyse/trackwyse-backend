#!/bin/bash
# navigate into current working directory

cd /home/ubuntu/trackwyse-backend-node

# install node modules

yarn install

# build the project

yarn build

# start our node app in the background using pm2

sudo pm2 start npm --name "trackwyse-backend-node" -- start