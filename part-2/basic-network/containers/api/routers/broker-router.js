import express from 'express';
const brokerClientFlorence = require('../client/clientBuilder').brokerClientFlorence;
const brokerClientParis = require('../client/clientBuilder').brokerClientParis;
const router = express.Router()
const ownerClientFlorence = require('../client/clientBuilder').ownerClientFlorence;

import config from '../config';

const peerMap = {
  florence: brokerClientFlorence,
  paris: brokerClientParis
}

function getClient(k) {
  return peerMap[k]
}

async function createBroker(user, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'create_broker', user)
    return response
  } catch (e) {
    throw e
  }
}

async function getBrokerageRequests(user, client) {
  try {
    const response = await client.query(config.chaincodeId, config.chaincodeVersion, 'get_brokerage_requests', user)
    return response
  } catch (e) {
    throw e
  }
}

async function approveBrokerageRequest(parameters, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'approve_brokerage_request', parameters)
    return response
  } catch (e) {
    throw e
  }
}

async function getInventory(parameters, client) {
  try {
    const response = await client.query(config.chaincodeId, config.chaincodeVersion, 'list_broker_inventory', parameters)
    return response
  } catch (e) {
    throw e
  }
}

async function sellArt(parameters, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'sell_art', parameters)
    return response

  } catch (e) {
    throw e
  }
}
module.exports = () => {

  /**
  * @api {post} /api/organizations/brokers/peers/:peerid Post a new Broker
  * @apiName PostBroker
  * @apiGroup Broker
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
  router.post(`/organizations/brokers/peers/:peerid/`, async (req, res) => {
    const broker = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    }
    try {
      const response = await createBroker(broker, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("couldn't create Broker")
    }
  });


  /**
  * @api {get} /organizations/brokers/peers/:peerid/users/:brokerid/requests Retrieve a list of broker proposals
  * @apiName GetBrokerageProposals
  * @apiGroup Broker
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} brokerid user id of brokerage
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *    [
  *      {
  *        artist: "Joe Mcgee",
  *        art: "silver-ship",
  *        broker: "The Gala: Florence",
  *        price: 600,
  *        margin: 10,
  *        UUID: "0e6ed385-d1b2-427f-8e57-3c40bebf6337"
  *      }
  *    ]
  */
  router.get(`/organizations/brokers/peers/:peerid/users/:brokerid/requests`, async (req, res) => {
    const user = {
      broker: req.params.brokerid
    }
    try {
      const response = await getBrokerageRequests(user, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Couldn't get brokerage requests")
    }
  });


  /**
  * @api {post} /organizations/brokers/peers/:peerid/users/:brokerid/requests/:requestid/approve Approve a brokerage request from an artist
  * @apiName PostApproveBrokerageProposal
  * @apiGroup Broker
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} brokerid user id of brokerage
  * @apiParam {String} requestid id referencing the particular brokerage request
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *      {
  *        Message: "Brokerage proposal accepted"
  *      }
  */
  router.post(`/organizations/brokers/peers/:peerid/users/:brokerid/requests/:requestid/approve`, async (req, res) => {
    const parameters = {
      UUID: req.params.requestid,
      inventoryUUID: "inventory-0" //uuid()
    }
    try {
      const response = await approveBrokerageRequest(parameters, getClient(req.params.peerid))
      res.json(response)
      } catch (e) {
        console.log(e)
        res.json("couldn't approve brokerage Request")
      }
  });


  /**
  * @api {get} /organizations/brokers/peers/:peerid/users/:brokerid/inventory/  Retrieve a list of a brokers inventory
  * @apiName GetBrokerInventory
  * @apiGroup Broker
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} brokerid user id of brokerage
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *  [
  *    {
  *      Broker: "gala-florence",
  *      Price: 660,
  *      UUID: "inventory-0",
  *      Proposal: {
  *        artist: "Joe Mcgee",
  *        art: "silver-ship",
  *        broker: "gala-florence",
  *        price: 600,
  *        margin: 10,
  *        UUID: "request-0",
  *        reviewed: true,
  *        approved: true
  *      }
  *    }
  *  ]
  */
  router.get(`/organizations/brokers/peers/:peerid/users/:brokerid/inventory/`, async (req, res) => {
    const parameters = {
      broker: req.params.brokerid
    }
    try {
      const response = await getInventory(parameters, getClient(req.params.peerid))
      console.log('api', response)
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Couldn't get inventory")
    }
  });

    /**
  * @api {post} /organizations/brokers/peers/:peerid/users/:brokerid/inventory/:inventoryid/sell Transfers asset ownership to owner from broker
  * @apiName PostSellArt
  * @apiGroup Broker
  * @apiParam {String} peerid peer within orgaization
  * @apiParam {String} brokerid user id of brokerage
  * @apiParam {String} requestid id referencing the particular brokerage request
  * @apiParam {String} inventoryid id referencing inventory to be sold
  * @apiParam (Request body) {String} owner username for owner
  * @apiSuccessExample {json} Success-Response:
  *    HTTP/1.1 200 OK
  *      {
  *        Message: "silver-ship has been sold by gala-florence to Cornelius"
  *      }
  */
  router.post(`/organizations/brokers/peers/:peerid/users/:brokerid/inventory/:inventoryid/sell`, async (req, res) => {
    const parameters = {
     broker: req.params.brokerid,
     owner: req.body.owner,
     inventory: req.params.inventoryid
    }

    try {
      const response = await sellArt(parameters, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Could sell Inventory")
    }
  })


  return router
}