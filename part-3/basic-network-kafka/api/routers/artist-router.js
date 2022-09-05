import express from 'express';
import uuid from 'uuid4';
const artistClientFlorence = require('../client/clientBuilder').artistClientFlorence;
const artistClientParis = require('../client/clientBuilder').artistClientParis;
const router = express.Router()

import config from '../config';

const peerMap = {
  florence: artistClientFlorence,
  paris: artistClientParis
}

function getClient(k) {
  return peerMap[k]
}

function* idHelper() {
  let index = 0
  while (index < index+1) {
    yield index++;
  }
}

let idGen = idHelper()

async function createArtist(user, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'create_artist', user)
    return response
  } catch (e) {
    throw e
  }
}

async function registerArt(art, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'register_art', art)
    return response
  } catch (e) {
    throw e
  }
}

async function sendBrokerageRequest(proposal, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'artist_send_brokerage_request', proposal)
    return response
  } catch (e) {
    throw e
  }
}

module.exports = () => {


  /**
  * @api {post} /api/organizations/:organizationid/peers/:peerid Post a new Artist
  * @apiName PostArtist
  * @apiGroup Artist
  * @apiParam {String} peerid peer within orgaization
  * @apiParam (Request body) {String} name
  * @apiParam (Request body) {String} username
  * @apiParam (Request body) {String} password
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *    {
  *      "Message": "Success"
  *    }
  */
  router.post('/organizations/artists/peers/:peerid/', async (req, res) => {
    const artist = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    }
    try {
      let response = await createArtist(artist, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("couldn't create Artist")
    }
  });

  /**
  * @api {post} /organizations/artists/peers/:peerid/users/:artistid/art Post an art registration
  * @apiName PostArt
  * @apiGroup Artist
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} artistid artist username
  * @apiParam (Request body) {String} name name of work
  * @apiParam (Request body) {String} description description of artwork
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *    {
  *      "Message": Artwork " + art.Name + " has been Registered"
  *    }
  */
  router.post('/organizations/artists/peers/:peerid/users/:artistid/art', async (req, res) => {
    const art = {
      name: req.body.name,
      artist: req.params.artistid,
      description: req.body.description
    }
    try {
      const response = await registerArt(art, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Error registering art")
    }
  });


  /**
  * @api {post} /organizations/artists/peers/:peerid/users/:artistid/art/:artid/broker Send a proposal for a broker to sell art
  * @apiName PostArtistBrokerProposal
  * @apiGroup Artist
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} artistid artist username
  * @apiParam {String} artid name of artwork to be sold
  * @apiParam (Request body) {String} price price for art
  * @apiParam (Request body) {String} margin a proportion offered to brokerage
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *    {
  *      Message: "Proposal for " + broker.Name + " to sell " + art.Name + " has been created and sent"
  *    }
  */
  router.post('/organizations/artists/peers/:peerid/users/:artistid/art/:artid/broker', async (req, res) => {
    const proposal = {
      artist: req.params.artistid,
      art: req.params.artid,
      broker: req.body.broker,
      price: Number(req.body.price),
      margin: Number(req.body.margin),
      UUID: "request-" + idGen.next().value //uuid()
    }
    try {
      const response = await sendBrokerageRequest(proposal, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("couldn't send request to broker")
    }
  });

  return router
}