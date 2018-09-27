# Part 1 - Building our usecase

## We will Answer the questions inside this markdown

1. Explain the art forgery problem and mention current Solutions

Art forgery, and the problems it causes in the broader art market, can be generalized to the economic notion of market failure propagated by information asymmetry.  This economic notion is subdivided into two cases, both which are applicable to art forgery. Firstly, the case where the seller has greater information than the buyer, and secondly, vice versa.   In the seller dominant case, such a when a dealer will knowingly sell a forgery as authentic, we see a market collapse due a phenomenon called adverse selection.  In the opposite case, we see a collapse due to something called moral hazard.  At its core the art market suffers from moral hazard and adverse selection as the market, ailments that arise from large instances of information asymmetry.

The solutions positied to reduce market failure caused by information asymmetry in the art market involve centralizing art brokerages to create reputations and the formation of the catalogue raisonne to serve as an authoritative source for an artworks metadata.

2. Advantages and Disadvantages of using a blockchain solution

Changes in technology have prompted new means of brokering art and creating the catalogue raisonne.   Hashing a new works catalog raisonne before selling it through an ethereum based smart contract is the work of uppstart.io, such a move circumvents the need for large reputations to sell authentic art.  A decentralized method of creating a catalog raisonne is the goal of the Calder Foundation, such a method adds a layer of reassurance that a portion of a pieces metadata could become null or authoritative at the flip of a hat, or a connoisseurs opinion.

While public blockchain solutions like verisart, colored coins, and adappcity provide some measure of benefit in the realm of art forgery, their scope remains defined to establishing an artist focused catalog raisonne on the blockchain, they do nothing to helping currently derived works or creating an ecosystem for third parties to append to it.  In a sense these solutions are a new band aid on an old wound.  a permissioned blockchain can pick up where the public blockchain stops, providing benefits where needed downstream of the artist-broker relationship and facilitating provenance derivation for already created works.

A disadvantage of permission blockchained over current solutions are undoubtedly convenience- it is a lot more complex to facilitate the game through the blockchain than through traditional methods, not to mention more expensive.

3. A network to help the art market

  - Our network could help the art market creating a blockchain version of the calder foundation.

  - for our proof of concept we will initially create 3 organizations
  - - Orderer-Org
  - -  Controls Access to orderering service operations
  - - - Orderer certificates provide they keys to orderer transactions and accept updated blocks from peers
  - - - This authority rises in importance as decentralized orderers become demanded amonst interested parties
  - - - Let this orderer be hosted by a creater hosted vault of orderer keys and certs

  - - Artist-Org
  - - - An Organizational Level designed to authenticate Admin approved artists
  - - - - These Admins are Initially aproved by a creater vault Artist-Org/msp
  - - - Network demand is bounded by willingness to supply the network with Artist-Org peer nodes generated Admin certs



  - - Broker-Org
  - - Broker-Org Controls access to api services that involve taking on inventory and selling a broker request
  - - - An organization for the artists brokerage will help move art registered by an artist into a brokerage clearly
  - - - the brokerage organization will be bounded by demanded for private stores alongside a web of marketed art
  - - -  will have a multi party audit trail of works, reducing the need for reputation investment elsewere

  - - Owner-Org
  - - While a Broker may simply promise to blockcert their artist approved brokerage into their desired public chain
  - - A Subset of individuals have no use for art creation, but its require services for secondary market brokeraging, or prior work registration
  - - Owner Peers would be bounded by the demand for a more complete and dynamic secondary workflows.
  - - - Holders of art that are not artists will need their own keys to the blockchain to continue this workflow as they themselves buy and sell art through the brokerage
  - - This project will append our Owner-org in part-3 ```./bootstrap-extension.sh```


  - Our chaincode will encompass the following workflow
  - - Register Artist user
  - - - This would be a creator of art under an organization
  - - - - creates contract with brokerage that enables such brokerage to place on the shelf if you will.
  - - Have him register a work of art on caldera
  - - - Such data structure is of interest but not a topic of this tour
  - - Register broker
  - - - A brokerage peer under the authority Admin has a worker
  - - - - this worker is the broker user
  - - have the artist request the broker to broker art
  - - have the brokerage approve the request
  - - register owner
  - - owner buys art from brokerage

  - A generic query can be made to a piece of arts Transaction and Block history as it mutates from state to state
  - - each organization will have a certificate authority and and two peers

