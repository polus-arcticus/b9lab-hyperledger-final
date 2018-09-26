# Part 2 Create a Network

This section takes us through the creation of a fabric network

## Setup

Let's begin our Journey by bootstrapping a basic network.


1. Configuration with docker-compose and cryptogen
  - add the path to cryptogen and configtxgen to the PATH env variable

```./bootstrap-basic.sh```

2. Configuration with docker-compose and fabric-ca (no cryptogen)
 - this section is a splice between
 - ishan gulane ibm/build blockchain insurance app
 - fabric-samples fabric-ca

```cd basic-network-ca```
```./start.sh```

This will bootstrap a root certificate authority for each organization in our network,
use volume mapped scripts to generate configtxgen material,
and spin up our peers and orderer node.

in a new terminal window
```./runApi.sh```
will bootstrap our apis loaded with our node js clients to our network
if running you see
```cp: cannot stat ...```
quit the command, apply permissions to the data folder.
```sudo chmod -R 777 ./data```
feel free to go to localhost 3000 again to invoke and query the chaincode
