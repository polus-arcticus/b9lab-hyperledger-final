import express from 'express';

const insuranceClientFlorence = require('../client/clientBuilder').insuranceClientFlorence;
const insuranceClientParis = require('../client/clientBuilder').insuranceClientParis;
const router = express.Router()

import config from '../config';


module.exports = () => {
  return router
}