import express from 'express';

const ownerClientFlorence = require('../client/clientBuilder').ownerClientFlorence;
const ownerClientParis = require('../client/clientBuilder').ownerClientParis;
const router = express.Router()

import config from '../config';

const peerMap = {
  florence: ownerClientFlorence,
  paris: ownerClientParis
}

function getClient(k) {
  return peerMap[k]
}

async function createOwner(user, client) {
  try {
    const response = await client.invoke(config.chaincodeId, config.chaincodeVersion, 'create_owner', user)
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
      const response = await createOwner(user, getClient(req.params.peerid))
      res.json(response)
    } catch (e) {
      console.log(e)
      res.json("Couldn't register owner")
    }
  })
  return router
}