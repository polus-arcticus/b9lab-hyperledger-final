import express from 'express';

const provenanceClientFlorence = require('../client/clientBuilder').provenanceClientFlorence;
const provenanceClientParis = require('../client/clientBuilder').provenanceClientParis;
const router = express.Router()

import config from '../config';


module.exports = () => {
  return router
}