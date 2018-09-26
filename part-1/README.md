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
  - - - Transaction orderering will be important in this market, so we must delegate these key and certs to an unbiased source such as a conglomerate or consortium of interested actors

  - - Artist-Org
  - - - An organization level belonging to an artist will be useful in registering new works onto our blockchain with authority.

  - - Broker-Org
  - - - An organization for the artists brokerage will help move art registered by an artist into a brokerage clearly
  - - - the brokerage organization will have an audit trail of works, reduing the need for reputation

  - - Owner-Org
  - - - Holders of art that are not artists will need their own keys to the blockchain to continue this workflow as they themselves buy and sell art through the brokerage

  - Our chaincode will encompass the following workflow
  - - Register Artist
  - - Have him register a work of art on caldera
  - - Register broker
  - - have the artist request the broker to broker art
  - - have the brokerage approve the request
  - - register owner
  - - owner buys art from brokerage

  - - each organization will have a certificate authority and and two peers

  - - our operation will exist on a single channel, noting the potential use of private data stores to enchance a brokerages privacy down the line.