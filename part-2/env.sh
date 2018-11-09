#!/bin/bash

# Script to manage env for bootstrap

## adding the location to cryptogen and configtxgen in the paths env
PATH=$HOME/fabric-samples/bin:$PATH
MAINPATH=$(pwd)
CLIPATH=$MAINPATH/basic-network/containers/cli/peers
ORDERERS=$CLIPATH/ordererOrganizations
PEERS=$CLIPATH/peerOrganizations
CONTAINERS=$MAINPATH/basic-network/containers
ARTISTCAPATH=$CONTAINERS/artist/artistCA
BROKERCAPATH=$CONTAINERS/broker/brokerCA
WEBCERTS=$CONTAINERS/api/certs

function inspect {
  while true; do
    read -p "Continue?: " yn
    case $yn in
      [Yy]* ) break;;
      [Nn]* ) continue;;
      *) echo "please use y or n";;
  esac
  done
}

function clearContainers {
  rm -rf $CLIPATH
  rm -rf $WEBCERTS
  rm -rf $CONTAINERS/orderers/ordererFlorence/crypto
  rm -rf $CONTAINERS/orderers/ordererParis/crypto
  rm -rf $CONTAINERS/orderers/ordererSolo/crypto
  rm -rf $CONTAINERS/artist/artistPeerFlorence/crypto
  rm -rf $CONTAINERS/artist/artistPeerParis/crypto
  rm -rf $CONTAINERS/broker/brokerPeerFlorence/crypto
  rm -rf $CONTAINERS/broker/brokerPeerParis/crypto

  rm -rf $ARTISTCAPATH/ca
  rm -rf $BROKERCAPATH/ca

  rm -rf $ARTISTCAPATH/tls
  rm -rf $BROKERCAPATH/tls
}

function buildDocker {
  docker build -t b9orderer:latest $CONTAINERS/orderers/ordererSolo
  docker build -t artist-peer-florence:latest $CONTAINERS/artist/artistPeerFlorence/
  docker build -t artist-peer-paris:latest $CONTAINERS/artist/artistPeerParis/
  docker build -t b9cli:latest $CONTAINERS/cli
  docker build -t artist-ca:latest $CONTAINERS/artist/artistCA
  docker build -t broker-ca:latest $CONTAINERS/broker/brokerCA
  docker build -t broker-peer-florence:latest $CONTAINERS/broker/brokerPeerFlorence/
  docker build -t broker-peer-paris:latest $CONTAINERS/broker/brokerPeerParis/
  docker build -t api:latest $CONTAINERS/api
}

function clearDocker {
docker rm -f $(docker ps -aq)
docker rmi $(docker images | grep 'dev-artist-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-broker-peer-florence-caldera')
docker rmi $(docker images | grep 'dev-owner-peer-florence-caldera')
docker rmi $(docker images | grep "^<none>" | awk "{print $3}")
}
