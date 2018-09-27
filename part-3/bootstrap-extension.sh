#!/bin/bash

function org3Api {
  echo '#### we will run another docker-compose to boot our api and invoke/ query our cc'
  cp $CONTAINERS/orderers/ordererSolo/crypto/tls/ca.crt $ORG3CONTAINERPATH/api/certs/ordererOrg.pem
  cp $ORG3CONTAINERPATH/owner/ownerPeer/crypto/tls/ca.crt $ORG3CONTAINERPATH/api/certs/ownerOrg.pem
  docker build -t api-org3:latest $ORG3CONTAINERPATH/api
  docker-compose -f $ORG3PATH/docker-compose-api.yaml up
}

function org3DockerCompose {
  echo '#### Lets now boot the owner-ca, peer0.owner-org and the org3 cli'
  echo '#### Lets build our docker containers'
  docker build -t org3-peer:latest $ORG3CONTAINERPATH/owner/ownerPeer
  docker build -t org3-ca:latest $ORG3CONTAINERPATH/owner/ownerCA
  docker build -t org3cli:latest $ORG3CONTAINERPATH/cli
  echo '#### docker containers built'
  echo '#### lets run docker-compose to attach these containers to our network'
  docker-compose -f $ORG3PATH/docker-compose.yaml up -d
  docker cp $ORG3PATH/../scripts org3cli:/

  echo '#### lets now bash into our Org3cli to join the channel update our chaincode'
  echo '#### docker exec -it org3cli bash'
  echo '#### have your ran this cmd?'
  inspect
  echo '#### cd scripts'
  echo '#### chmod 777 joinOrg3.sh'
  echo '#### ./joinOrg3.sh'
  inspect
  echo '#### great now we can quickly update the chaincode on all our peers'
  echo '#### in the b9cli cd scripts and run'
  echo '#### ./updateCC.sh'
  inspect
  echo 'great We are now ready to boot our api for this new org and complete our chaincode workflow'
  inspect
  org3Api

}

function org3CryptoCreate {
  echo '#### Our strategy here will be to spin up a new docker-compose under the same docker network object'
  echo "#### This docker-compose will utilize the docker in docker model over volume mapping"
  echo "#### An Api will be constructed to finish our chaincode workflow"
  rm -rf $ORG3CONTAINERPATH/cli/peers
  rm -rf org3.json
  echo '#### we begin by creating new cryptographic material for our new Organization, dubbed Owner-Org'
  echo '#### for simplicity we will utilize cryptogen'
  rm -rf $ORG3PATH/crypto-config
  cryptogen generate  --config=$ORG3PATH/artifacts/crypto-config.yaml --output=$ORG3PATH/crypto-config
  rm -rf $ORG3CONTAINERPATH/cli/peers
  mkdir -p $ORG3CONTAINERPATH/cli/peers
  echo '#### We will take the ordererOrgs from our basic-network and add our new Owner-Org crypto to the peers'
  cp -r $ORG3PATH/crypto-config/peerOrganizations $ORG3CONTAINERPATH/cli/peers
  cp -r $CLIPATH/ordererOrganizations $ORG3CONTAINERPATH/cli/peers
  echo '#### configtxgen will convert our MSP object to a format ready for addition to our channel configuration'
  configtxgen --configPath=$ORG3PATH/artifacts/ -printOrg OwnerOrgMSP > $ORG3PATH/owner-org.json
  echo '#### lets send those off chain too our b9-cli container'
  docker cp $ORG3PATH/owner-org.json b9cli:/peers
  docker cp $ORG3PATH/crypto-config/peerOrganizations b9cli:/peers
  docker cp $MAINPATH/basic-network-extension/containers/api/chaincode/src b9cli:/opt/gopath/

  cp -r $CLIPATH/ordererOrganizations $ORG3PATH/crypto-config/

  rm -rf $ORG3CONTAINERPATH/owner/ownerPeer/crypto


  mkdir $ORG3CONTAINERPATH/owner/ownerPeer/crypto


  rm -rf $ORG3CONTAINERPATH/owner/ownerCA/ca
  rm -rf $ORG3CONTAINERPATH/owner/ownerCA/tls
  mkdir -p $ORG3CONTAINERPATH/owner/ownerCA/ca
  mkdir -p $ORG3CONTAINERPATH/owner/ownerCA/tls

  cp $ORG3PATH/crypto-config/peerOrganizations/owner-org/ca/* $ORG3CONTAINERPATH/owner/ownerCA/ca
  cp $ORG3PATH/crypto-config/peerOrganizations/owner-org/tlsca/* $ORG3CONTAINERPATH/owner/ownerCA/tls
  mv $ORG3CONTAINERPATH/owner/ownerCA/ca/*_sk $ORG3CONTAINERPATH/owner/ownerCA/ca/key.pem
  mv $ORG3CONTAINERPATH/owner/ownerCA/ca/*-cert.pem $ORG3CONTAINERPATH/owner/ownerCA/ca/cert.pem
  mv $ORG3CONTAINERPATH/owner/ownerCA/tls/*_sk $ORG3CONTAINERPATH/owner/ownerCA/tls/key.pem
  mv $ORG3CONTAINERPATH/owner/ownerCA/tls/*-cert.pem $ORG3CONTAINERPATH/owner/ownerCA/tls/cert.pem

  cp -r $ORG3PATH/crypto-config/peerOrganizations/owner-org/peers/peer0.owner-org/msp $ORG3CONTAINERPATH/owner/ownerPeer/crypto
  cp -r $ORG3PATH/crypto-config/peerOrganizations/owner-org/peers/peer0.owner-org/tls $ORG3CONTAINERPATH/owner/ownerPeer/crypto

  rm -rf $ORG3CONTAINERPATH/api/certs
  mkdir -p $ORG3CONTAINERPATH/api/certs

  cp  -r $CLIPATH $ORG3CONTAINERPATH/api
  cp $ORG3PATH/crypto-config/peerOrganizations/owner-org/users/Admin@owner-org/msp/keystore/* $ORG3CONTAINERPATH/api/certs/Admin@owner-org-key.pem
  cp $ORG3PATH/crypto-config/peerOrganizations/owner-org/users/Admin@owner-org/msp/signcerts/* $ORG3CONTAINERPATH/api/certs
  echo '#### provisioned containers with certs and keys'
  inspect
  echo "#### Okay our crypto has been created and deployed into images"
  echo "#### Now the heavy lifting for extension"
  echo "#### lets hop into our cli container"
  docker cp $ORG3PATH/../scripts/ b9cli:/opt/gopath/src/github.com/hyperledger/fabric
  inspect
  echo "#### Lets make a new terminal and run:"
  echo "#### docker exec -it b9cli bash"
  echo "#### have you ran this command"
  inspect
  echo "#### Great you'll notice that we have copied in some scripts to help us out"
  echo "#### cd scripts"
  inspect
  echo "#### I haven't figured out how to detach the configtxlator rest server yet in script"
  echo "#### please run"
  echo "#### apt update"
  echo "#### apt install jq -y"
  echo "#### configtxlator start &"
  echo "#### press enter twice to detach"
  echo "#### have you run these commands?"
  inspect
  echo '#### lets now run our extend script'
  echo '#### you may need to permisssion the script with'
  echo '#### chmod 777 ./extend.sh'
  echo "#### have your ran ./extend.sh?"
  inspect
  echo '#### Great we have now updated our channel configuration'
  echo '#### channel config complete ####'
}

function dockerCompose {
  echo '####'
  echo '#### Spinning up the network'
  echo '####'
  echo '#### with our crypto created and provisioned, we can now construct the docker containers'
  echo '#### Are you ready to build the docker containers?: '
  buildDocker
  echo '#### Finished Building Docker Containers'
  echo '#### Our docker containers referenced in our docker-compose file are now built and ready to be spun up'
  echo '#### now would be a good time to inspect the docker-compose yaml'
  echo '#### spinning up our network will also spin up our api which contains client instances for each peer'
  echo '#### now would be a good time to inspect ./containers/api/client/client.js and clientbuilder.js'
  echo '#### would you like to spin up the blockchain network?: '
  docker-compose -f basic-network-extension/docker-compose.yaml up -d
  echo '#### feel free to run'
  echo '#### docker logs api -f'
  echo '#### for details on the sdk handling the various steps involved in running a network'
  echo '#### now is a good time to look inside ./basic-network-extension/containers/api/client'
  echo '#### feel free to go into your browser and go to localhost:3000'
  echo '#### these api routes model a basic asset exchange workflow'
  echo '#### these api routes will trigger logs in the api'
  echo '#### feel free to look inside'
  echo '#### ./basic-network-extension/containers/api/chaincode/src/caldera/main.go'
  echo '#### to explore the chaincode'
  inspect
  echo '#### network is now running'
  echo '#### lets give us a second for our api container to install and instantiate our chaincode'
  echo '#### please go to localhost:3000 in a browser'
  echo '#### please click on the first 6 api routes'
  echo '#### this will create an artist and register the artwork'
  echo '#### and create a broker and register that art with it'
  echo '#### we do this now so that we do not have to switch the chaincode version once we upgrade'
  inspect
  echo '#### Basic-network bootstrap complete'
  echo '#### One will notice that registering our owner to complete our chaincode workflow fails'
  echo '#### Lets extend our network to add the owner peer and complete our chaincode asset exchange workflow'
  echo '#### Would you like to begin extending the network?: '
  inspect
}

function provisionApi {
  echo '####'
  echo '#### Provisioning Api'
  echo '####'
  echo '#### our basic-network-extension will handle handle channel creation and chaincode functions with the fabric node sdk'
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
  echo '#### feel free to take a moment to review ./basic-network-extension/artifacts/crypto-config.yaml'
  echo '#### Configuration continues with the configtxgen binary'
  echo '#### configtxgen consumes a configtx object which specifies channel configuration'
  echo '#### configtxgen outputs artifacts nessissary to initialize a blockchain'
  echo '#### feel free to take a moment to review ./basic-network-extension/artifacts/configtx.yaml'
  echo '#### with these two configuration objects we can go ahead a generate the keys and certs'
  cryptogen generate  --config=$MAINPATH/basic-network-extension/artifacts/crypto-config.yaml --output=$CLIPATH
  echo '#### feel free to take a moment to review ./basic-network-extension/containers/cli/peers for what was just generated'
  echo '#### we can now create the genesis block by consuming configtx.yaml'
  echo '#### are you ready to create the genesis block with configtxgen?: '
  configtxgen --configPath=$MAINPATH/basic-network-extension/artifacts/ -profile CalderaOrdererGenesis  -outputBlock=$CLIPATH/genesis.block
  echo "#### genesis block created in ./basic-network-extension/containers/cli"
  echo '#### this block is vital to the creation of a shared state'
  echo '#### we can now create a channel.tx envelope which serves as the authoritiate channel configuration spec'
  echo '#### are you ready to generate the channel configuration envelope?'
  configtxgen --configPath=$MAINPATH/basic-network-extension/artifacts/ -profile CalderaChannel -outputCreateChannelTx $CLIPATH/Caldera.tx -channelID caldera
  echo '#### By default peers on the same channel may be inivisible to one another without anchor peers.'
  echo '#### to enabled cross-org gossip we generate Anchor envelopes'
  echo '#### are you ready to generate the anchor peer txs?: '
  configtxgen --configPath=$MAINPATH/basic-network-extension/artifacts/ -profile CalderaChannel -outputAnchorPeersUpdate $CLIPATH/ArtistOrgMSPAnchors.tx -channelID caldera -asOrg ArtistOrgMSP
  configtxgen --configPath=$MAINPATH/basic-network-extension/artifacts/ -profile CalderaChannel -outputAnchorPeersUpdate $CLIPATH/BrokerOrgMSPAnchors.tx -channelID caldera -asOrg BrokerOrgMSP
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
  org3CryptoCreate
  org3DockerCompose
}

main