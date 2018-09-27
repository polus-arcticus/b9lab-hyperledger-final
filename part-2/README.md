# Part 2 Create a Network

This section takes us through the creation of a fabric network

## Setup

Let's begin our Journey by bootstrapping a basic network.


1. Configuration with docker-compose and cryptogen
  - add the path to cryptogen and configtxgen to the PATH env variable

```./bootstrap-basic.sh```

I hope you had fun :)

Make sure to decompose our network to do this next part

```docker rm -f $(docker ps -q)```
well at least take the down the api, our new api will port map to the same localhost

okay round two, lets configure our network to abandon our conveinent but insecure cryptogen

2. Configuration with docker-compose and fabric-ca (no cryptogen)
 - this section is a splice between
 - ishan gulane ibm/build blockchain insurance app
 - fabric-samples fabric-ca

```cd basic-network-ca```
```./start.sh```
Given that the courses proposed fabric-ca cryptogen was abandoned in the fab, this project uses a splice of fabric-sample/fabric-ca to generate the correct certs
-
This will bootstrap a root certificate authority for each organization in our network,
use volume mapped scripts to generate configtxgen material,
and spin up our peers and orderer node.

in a new terminal window
```./runApi.sh```
will bootstrap our apis loaded with our node js clients to our network
if running you see
```cp: cannot stat ...```
quite the command, apply permissions to the data folder.
```sudo chmod -R 777 ./data```
feel free to go to localhost 3000 again to invoke and query the chaincode
again our part 3 api routes are not available

Okay great Lets head over to Part 3
Dont for get to decompose the network :)
