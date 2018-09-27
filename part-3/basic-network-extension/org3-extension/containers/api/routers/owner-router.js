import express from 'express';

const ownerClient0 = require('../client/clientBuilder').ownerClient0;

const router = express.Router()

import config from '../config';

const peerMap = {
  florence: ownerClient0
}

function getClient(k) {
  return peerMap[k]
}

async function createOwner(user) {
  try {
    const response = await ownerClient0.invoke(config.chaincodeId, config.chaincodeVersion, 'create_owner', user)
    return response
  } catch (e) {
    throw e
  }
}

async function queryInventory(object) {
  try {
    const response = await ownerClient0.query(config.chaincodeId, config.chaincodeVersion, 'list_broker_inventory', object)
    return response
  } catch (e) {
    throw e
  }
}

async function sellArt(parameters) {
  try {
    const response = await ownerClient0.invoke(config.chaincodeId, config.chaincodeVersion, 'sell_art', parameters)
    return response
  } catch (e) {
    throw e
  }
}

module.exports = () => {

  router.post(`/organizations/owners/peers/:peerid/`, async (req, res) => {
    const user = {
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    }
    try {
      const response = await createOwner(user)
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Couldn't register owner")
    }
  })

  router.get(`/organizations/brokers/peers/florence/users/gala-florence/inventory`, async (req, res) => {
    const object = {
      broker: 'gala-florence'
    }
    try {
      let response = await queryInventory(object)
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("couldnt access blockchain")
    }
  });

  router.post(`/organizations/brokers/peers/:peerid/users/:brokerid/inventory/:inventoryid/sell`, async (req, res) => {
    const parameters = {
      owner: req.body.owner,
      inventory: req.params.inventoryid
    }

    try {
      const response = await sellArt(parameters)
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("error selling art")
    }
  })
  return router
}