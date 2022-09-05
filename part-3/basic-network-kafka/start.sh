#!/bin/sh

export PATH=$GOPATH/src/github.com/hyperledger/fabric-samples/bin:$PATH
MAINPATH=$(pwd)
rm -rf ./artifacts/channel-artifacts
rm -rf ./artifacts/crypto-config
mkdir -p ./artifacts/channel-artifacts
rm -rf ./api/Caldera.tx
cryptogen generate --config=$MAINPATH/artifacts/crypto-config.yaml --output=./artifacts/crypto-config

configtxgen --configPath ./artifacts -profile CalderaOrdererGenesis -outputBlock ./artifacts/channel-artifacts/genesis.block

configtxgen --configPath ./artifacts -profile CalderaChannel -outputCreateChannelTx ./artifacts/channel-artifacts/Caldera.tx -channelID caldera

configtxgen --configPath ./artifacts -profile CalderaChannel -outputAnchorPeersUpdate ./artifacts/channel-artifacts/ArtistOrgMSPAnchors.tx -channelID caldera -asOrg ArtistOrgMSP

cp ./artifacts/channel-artifacts/Caldera.tx ./api

configtxgen --configPath ./artifacts -profile CalderaChannel -outputAnchorPeersUpdate ./artifacts/channel-artifacts/BrokerOrgMSPAnchors.tx -channelID caldera -asOrg BrokerOrgMSP


WEBCERTS=./api/certs

rm -rf $WEBCERTS
mkdir -p $WEBCERTS


cp ./artifacts/crypto-config/peerOrganizations/artist-org/users/Admin@artist-org/msp/keystore/* $WEBCERTS/Admin@artist-org-key.pem
cp ./artifacts/crypto-config/peerOrganizations/artist-org/users/Admin@artist-org/msp/signcerts/* $WEBCERTS/
cp ./artifacts/crypto-config/peerOrganizations/broker-org/users/Admin@broker-org/msp/keystore/* $WEBCERTS/Admin@broker-org-key.pem
cp ./artifacts/crypto-config/peerOrganizations/broker-org/users/Admin@broker-org/msp/signcerts/* $WEBCERTS/
docker rm -f $(docker ps -aq)
docker rmi $(docker images | grep 'dev-artist-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-broker-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-owner-peer-florence-caldera')
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
rm -rf ./cli/peers
mkdir -p ./cli/peers
cp -r ./artifacts/crypto-config ./cli/peers
docker build -t b9-cli-2:latest ./cli
docker build -t b9-api:latest ./api
docker-compose up