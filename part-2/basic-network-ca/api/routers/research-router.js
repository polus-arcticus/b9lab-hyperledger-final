import express from 'express';

const researchClientFlorence = require('../client/clientBuilder').researchClientFlorence;
const researchClientParis = require('../client/clientBuilder').researchClientParis;
const router = express.Router()

import config from '../config';


module.exports = () => {
  return router
}