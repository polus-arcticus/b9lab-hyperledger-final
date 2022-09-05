#!/bin/bash




function dockerCompose {
  echo '####'
  echo '#### Spinning up the network'
  echo '####'
  echo '#### with our crypto created and provisioned, we can now construct the docker containers'
  echo '#### Are you ready to build the docker containers?: '
  inspect
  buildDocker
  echo '#### Finished Building Docker Containers'
  echo '#### Our docker containers referenced in our docker-compose file are now built and ready to be spun up'
  echo '#### now would be a good time to inspect the docker-compose yaml'
  inspect
  echo '#### spinning up our network will also spin up our api which contains client instances for each peer'
  echo '#### now would be a good time to inspect ./containers/api/client/client.js and clientbuilder.js'
  echo '#### would you like to spin up the blockchain network?: '
  echo '#### !!!! THIS NETWORK WAS BUILT ON 1.2 PEER nodes !!! ####'

  inspect
  docker-compose -f basic-network/docker-compose.yaml up -d
  echo '#### feel free to run'
  echo '#### docker logs api -f'
  echo '#### for details on the sdk handling the various steps involved in running a network'
  echo '#### now is a good time to look inside ./basic-network/containers/api/client'
  inspect
  echo '#### !!!! WARNING OUR WORKFLOW IS INCOMPLETE! WAIT FOR PART 3 !!!! ####'
  echo '#### feel free to go into your browser and go to localhost:3000'
  echo '#### these api routes model a basic asset exchange workflow'
  echo '#### these api routes will trigger logs in the api'
  echo '#### feel free to look inside'
  echo '#### ./basic-network/containers/api/chaincode/src/caldera/main.go'
  echo '#### to explore the chaincode'
  inspect
  echo '#### Basic-network bootstrap complete'
  echo '#### Next on the list will be swapping cryptogen for fabric-ca'
}

function provisionApi {
  echo '####'
  echo '#### Provisioning Api'
  echo '####'
  echo '#### our basic-network will handle handle channel creation and chaincode functions with the fabric node sdk'
  echo '#### as such we will create a restful api that will construct a fabric client'
  echo '#### while each organization would technically have its own api, for simplicity we will build clients for each peer on one api'
  echo '#### our api then requires the channel tx envolope, Admin org key and sign certs, and peer ca tls pem for each organization'
  cp $CLIPATH/Caldera.tx $CONTAINERS/api
  mkdir -p $WEBCERTS
  cp $CONTAINERS/orderers/ordererSolo/crypto/tls/ca.crt $WEBCERTS/ordererOrg.pem
  cp $CONTAINERS/artist/artistPeerFlorence/crypto/tls/ca.crt $WEBCERTS/artistOrg.pem
  cp $CONTAINERS/broker/brokerPeerFlorence/crypto/tls/ca.crt $WEBCERTS/brokerOrg.pem

  cp $PEERS/artist-org/users/Admin@artist-org/msp/keystore/* $WEBCERTS/Admin@artist-org-key.pem
  cp $PEERS/artist-org/users/Admin@artist-org/msp/signcerts/* $WEBCERTS/
  cp $PEERS/broker-org/users/Admin@broker-org/msp/keystore/* $WEBCERTS/Admin@broker-org-key.pem
  cp $PEERS/broker-org/users/Admin@broker-org/msp/signcerts/* $WEBCERTS/
  echo '####'
  echo '#### Finished Provisioning our API'
  echo '####'
}

function provisionCrypto {
  echo '####'
  echo '#### Provisioning Crypto to actors ####'
  echo '####'
  echo '#### Our boilerplate follows Ishane Gulhanes build-blockchain-insurance-app'
  echo '#### this architecture replaces volume mapping our crypto in our docker-compose with a docker-in-docker build'
  echo '#### docker-in-docker refers to creating a docker image around the cooresponding hyperledger fabric image that holds the crypto'
  echo '#### Not efficient, and appears to break kafka dns resolution with zookeeper but good at illustration which peer requires what to operate'
  mkdir $CONTAINERS/orderers/ordererSolo/crypto
  mkdir $CONTAINERS/artist/artistPeerFlorence/crypto
  mkdir $CONTAINERS/artist/artistPeerParis/crypto
  mkdir $CONTAINERS/broker/brokerPeerFlorence/crypto
  mkdir $CONTAINERS/broker/brokerPeerParis/crypto
  echo '#### each organization msp is passed to the respective peers'
  cp -r $ORDERERS/orderer-org/orderers/orderer0.orderer-org/msp $CONTAINERS/orderers/ordererSolo/crypto
  cp -r $PEERS/artist-org/peers/artist-peer-florence.artist-org/msp $CONTAINERS/artist/artistPeerFlorence/crypto
  cp -r $PEERS/artist-org/peers/artist-peer-paris.artist-org/msp $CONTAINERS/artist/artistPeerParis/crypto
  cp -r $PEERS/broker-org/peers/broker-peer-florence.broker-org/msp $CONTAINERS/broker/brokerPeerFlorence/crypto
  cp -r $PEERS/broker-org/peers/broker-peer-paris.broker-org/msp $CONTAINERS/broker/brokerPeerParis/crypto
  echo '#### tls certs are also passed'
  cp -r $ORDERERS/orderer-org/orderers/orderer0.orderer-org/tls $CONTAINERS/orderers/ordererSolo/crypto
  cp -r $PEERS/artist-org/peers/artist-peer-florence.artist-org/tls $CONTAINERS/artist/artistPeerFlorence/crypto
  cp -r $PEERS/artist-org/peers/artist-peer-paris.artist-org/tls $CONTAINERS/artist/artistPeerParis/crypto
  cp -r $PEERS/broker-org/peers/broker-peer-florence.broker-org/tls $CONTAINERS/broker/brokerPeerFlorence/crypto
  cp -r $PEERS/broker-org/peers/broker-peer-paris.broker-org/tls $CONTAINERS/broker/brokerPeerParis/crypto
  echo '#### orderers need the genesis block, lets pass it'
  cp $CLIPATH/genesis.block $CONTAINERS/orderers/ordererSolo/crypto
  mkdir -p $ARTISTCAPATH/ca
  mkdir -p $BROKERCAPATH/ca
  mkdir -p $ARTISTCAPATH/tls
  mkdir -p $BROKERCAPATH/tls
  echo '#### our certificate authorities need the ca/ and tlsca/ crypto, lets pass it'
  cp $PEERS/artist-org/ca/* $ARTISTCAPATH/ca
  cp $PEERS/artist-org/tlsca/* $ARTISTCAPATH/tls
  mv $ARTISTCAPATH/ca/*_sk $ARTISTCAPATH/ca/key.pem
  mv $ARTISTCAPATH/ca/*-cert.pem $ARTISTCAPATH/ca/cert.pem
  mv $ARTISTCAPATH/tls/*_sk $ARTISTCAPATH/tls/key.pem
  mv $ARTISTCAPATH/tls/*-cert.pem $ARTISTCAPATH/tls/cert.pem

  cp $PEERS/broker-org/ca/* $BROKERCAPATH/ca
  cp $PEERS/broker-org/tlsca/* $BROKERCAPATH/tls
  mv $BROKERCAPATH/ca/*_sk $BROKERCAPATH/ca/key.pem
  mv $BROKERCAPATH/ca/*-cert.pem $BROKERCAPATH/ca/cert.pem
  mv $BROKERCAPATH/tls/*_sk $BROKERCAPATH/tls/key.pem
  mv $BROKERCAPATH/tls/*-cert.pem $BROKERCAPATH/tls/cert.pem
  echo "####"
  echo "#### Crypto Provision Complete"
  echo "####"
}

function cryptoCreate {
  echo '####'
  echo '#### Generating Fabric configuration artifacts ####'
  echo '####'
  echo '#### The creation of our network requires a configuration to be expressed in a docker-compose object.'
  echo '#### many values reference cryptographic material, our basic bootstrap will create this using fabric binary cryptogen'
  echo '#### cryptogen itself requires its own configuration, this is referenced in a crypto-config object'
  echo '#### feel free to take a moment to review ./basic-network/artifacts/crypto-config.yaml'
  inspect
  echo '#### Configuration continues with the configtxgen binary'
  echo '#### configtxgen consumes a configtx object which specifies channel configuration'
  echo '#### configtxgen outputs artifacts nessissary to initialize a blockchain'
  echo '#### feel free to take a moment to review ./basic-network/artifacts/configtx.yaml'
  inspect
  echo '#### with these two configuration objects we can go ahead a generate the keys and certs'
  cryptogen generate  --config=$MAINPATH/basic-network/artifacts/crypto-config.yaml --output=$CLIPATH
  echo '#### feel free to take a moment to review ./basic-network/containers/cli/peers for what was just generated'
  inspect
  echo '#### we can now create the genesis block by consuming configtx.yaml'
  echo '#### are you ready to create the genesis block with configtxgen?: '
  inspect
  configtxgen --configPath=$MAINPATH/basic-network/artifacts/ -profile CalderaOrdererGenesis  -outputBlock=$CLIPATH/genesis.block
  echo "#### genesis block created in ./basic-network/containers/cli"
  echo '#### this block is vital to the creation of a shared state'
  echo '#### we can now create a channel.tx envelope which serves as the authoritiate channel configuration spec'
  echo '#### are you ready to generate the channel configuration envelope?'
  inspect
  configtxgen --configPath=$MAINPATH/basic-network/artifacts/ -profile CalderaChannel -outputCreateChannelTx $CLIPATH/Caldera.tx -channelID caldera
  echo '#### By default peers on the same channel may be inivisible to one another without anchor peers.'
  echo '#### to enabled cross-org gossip we generate Anchor envelopes'
  echo '#### are you ready to generate the anchor peer txs?: '
  inspect
  configtxgen --configPath=$MAINPATH/basic-network/artifacts/ -profile CalderaChannel -outputAnchorPeersUpdate $CLIPATH/ArtistOrgMSPAnchors.tx -channelID caldera -asOrg ArtistOrgMSP
  configtxgen --configPath=$MAINPATH/basic-network/artifacts/ -profile CalderaChannel -outputAnchorPeersUpdate $CLIPATH/BrokerOrgMSPAnchors.tx -channelID caldera -asOrg BrokerOrgMSP
  echo '####'
  echo '#### Artifact Generation Complete ####'
  echo "####"
}

function main {
  source ./env.sh
  clearDocker
  clearContainers
  cryptoCreate
  provisionCrypto
  provisionApi
  dockerCompose
}

main