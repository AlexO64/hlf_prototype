# A simple hyperledger fabric prototype

## Prerequisties
- You must have docker daemon installed and running
    - e.g with homebrew on mac
        - $ brew cask install docker
        - $ open /Applications/Docker.app
- You must have docker and docker-compose installed
    - e.g. with homebrew on mac
        - $ brew install docker docker-compose
- You must have node/npm installed

## Boostrap environment
$ ./scripts/bootstrap.sh

## Start/Stop the hyperledger network
$ cd basic-network
$ ./start.sh  
$ ./stop.sh

## Monitor network logs
$ cd basic-network
$ ./monitornetwork.sh

## Deploy initial version of the smart contract
$ docker-compose -f organization/prototypecorp/configuration/cli/docker-compose.yml up -d  
$ docker exec cli peer chaincode install -n prototypecontract -p /opt/gopath/src/github.com/contract -l node -v 0  
$ docker exec cli peer chaincode instantiate -n prototypecontract -l node -c '{"Args":["org.protonet.prototype:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')" -v 0  

## Upgrade the smart contract to <new_version>
$ docker-compose -f organization/prototypecorp/configuration/cli/docker-compose.yml up -d  
$ docker exec cli peer chaincode install -n prototypecontract -p /opt/gopath/src/github.com/contract -l node -v <new_version>  
$ docker exec cli peer chaincode upgrade -n prototypecontract -l node -c '{"Args":["org.protonet.prototype:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')" -v <new_version>  
OR
$ npm run contract-upgrade

## Run the test application
$ cd organization/prototypecorp/application  
$ npm install  
$ cd test  
$ node test  

## Run the webserver application
$ cd organization/prototypecorp/application  
$ npm install  
$ node server  

You can then connect to http://127.0.0.1:8080 to interact with the smart contract.

Usage:

http://127.0.0.1:8080/api/contract_method?argumentValue1&argumentValue2&etc...

Example:

http://127.0.0.1:8080/api/retrieveStorageObject?1

## Fabric contract API documentation
https://fabric-shim.github.io/release-1.4/index.html  
