/*import hfc from 'fabric-client';
import utils from 'fabric-client/lib/utils';
import CAClient from 'fabric-ca-client';
import User from 'fabric-client/lib/User';
import http from 'http';
import resolve from 'path'.resolve;
import url from 'url';
import Long from 'long';*/

import CalderaClient from './client';
import config from '../config';
import url from 'url';
import http from 'http';
import { resolve } from 'path';
process.env.GOPATH = resolve(__dirname, '../chaincode')

function unmarshalBlock(block) {
  const transactions = Array.isArray(block.data.data) ?
  block.data.data.map(({
    payload: {
      header,
      data
    }
  }) => {
    const {
      channel_header
    } = header;
    const {
      type,
      timestamp,
      epoch
    } = channel_header;
    return {
      type,
      timestamp
    };
  }) : [];
  return {
    id: block.header.number.toString(),
    fingerprint: block.header.data_hash.slice(0, 20),
    transactions
  };
}

function getAdminOrgs() {
  return Promise.all([
    artistClientFlorence.getOrgAdmin(),
    brokerClientFlorence.getOrgAdmin(),
    artistClientParis.getOrgAdmin(),
    brokerClientParis.getOrgAdmin(),


    ]);
}

/**
 * Enrolls a user with the respective CA.
 *
 * @export
 * @param {string} client
 * @param {string} enrollmentID
 * @param {string} enrollmentSecret
 * @param {object} { url, mspId }
 * @returns the User object
 */
async function getSubmitter(
  client, enrollmentID, enrollmentSecret, {
    url,
    mspId
  }) {

  try {
    let user = await client.getUserContext(enrollmentID, true);
    if (user && user.isEnrolled()) {
      return user;
    }

    // Need to enroll with CA server
    const ca = new CAClient(url, {
      verify: false
    });
    try {
      const enrollment = await ca.enroll({
        enrollmentID,
        enrollmentSecret
      });
      user = new User(enrollmentID, client);
      await user.setEnrollment(enrollment.key, enrollment.certificate, mspId);
      await client.setUserContext(user);
      return user;
    } catch (e) {
      throw new Error(
        `Failed to enroll and persist User. Error: ${e.message}`);
    }
  } catch (e) {
    throw new Error(`Could not get UserContext! Error: ${e.message}`);
  }
}

/*// Problematic function for variables with cases in centre
function marshalArgs(args) {
  if (!args) {
    return args
  }

  if (typeof args === 'string') {
    return [args];
  }

  let snakeArgs = camelToSnakeCase(args);

  if (Array.isArray(args)) {
    return args.map(
      arg => typeof arg === 'object' ? JSON.stringify(arg) : arg.toString());
  }

  if (typeof args === 'object') {
    return [JSON.stringify(args)];
  }
}

function unmarshalResult(result) {
  console.log("result", result)
  if (!Array.isArray(result)) {
    return result;
  }
  let buff = Buffer.concat(result);
  if (!Buffer.isBuffer(buff)) {
    return result;
  }
  let json = buff.toString('utf8');
  if (!json) {
    return null;
  }
  console.log(json)
  let obj = JSON.parse(json);
  return snakeToCamelCase(obj);
}*/


const artistClientFlorence = new CalderaClient(
  config.channelName,
  config['orderer0'],
  config.artistOrg['peer-florence'],
  config.artistOrg.ca,
  config.artistOrg.admin
);

const artistClientParis = new CalderaClient(
  config.channelName,
  config['orderer0'],
  config.artistOrg['peer-paris'],
  config.artistOrg.ca,
  config.artistOrg.admin
);

const brokerClientFlorence = new CalderaClient(
  config.channelName,
  config['orderer0'],
  config.brokerOrg['peer-florence'],
  config.brokerOrg.ca,
  config.brokerOrg.admin
);

const brokerClientParis = new CalderaClient(
  config.channelName,
  config['orderer0'],
  config.brokerOrg['peer-paris'],
  config.brokerOrg.ca,
  config.brokerOrg.admin
);

async function createNetwork() {
  try {
    await Promise.all([
      artistClientFlorence.login(),
      artistClientParis.login(),
      brokerClientFlorence.login(),
      brokerClientParis.login(),
      ]);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }

  try {
    await getAdminOrgs();
    if (!(await artistClientFlorence.checkChannelMembership())) {
      console.log('channel not found, creating Caldera channel');
      const createChannelResponse = await artistClientFlorence.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('caldera channel created!');
        console.log('attempting to join peers');
        await Promise.all([
          artistClientFlorence.joinChannel(),
          brokerClientFlorence.joinChannel(),
          brokerClientParis.joinChannel(),
          artistClientParis.joinChannel(),

          ]);

        await new Promise(resolve => {
          setTimeout(resolve, 10000);
        });
      }
    }
  } catch (e) {
    console.log('failed to create blockchain client');
    console.log(e)
    process.exit(-1)
  }

  try {
    await Promise.all([

          artistClientFlorence.initialize(),
          artistClientParis.initialize(),
          brokerClientFlorence.initialize(),
          brokerClientParis.initialize(),
      ])
  } catch (e) {
    console.log('error initializing client')
    console.log(e)
    process.exit(-1)
  }

  //chaincode install

  let installedOnArtistPeerFlorence, installedOnBrokerPeerFlorence /*installedOnInsurancePeerFlorence*/
  let installedOnArtistPeerParis, installedOnBrokerPeerParis //installedOnInsurancePeerParis


  try {
    await getAdminOrgs();
    installedOnArtistPeerFlorence = await artistClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnArtistPeerParis = await artistClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerFlorence = await brokerClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerParis = await brokerClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);

  } catch (e) {
    console.log('failed getting installation status')
    console.log(e);
    process.exit(-1);
  }

  if (!installedOnArtistPeerFlorence &&
      !installedOnBrokerPeerFlorence &&
      !installedOnArtistPeerParis &&
      !installedOnBrokerPeerParis
/*      !installedOnInsurancePeerFlorence &&
      !installedOnOwnerPeerFlorence &&
      !installedOnProvenancePeerFlorence &&
      !installedOnResearchPeerFlorence &&*/
/*      !installedOnInsurancePeerParis &&
      !installedOnOwnerPeerParis &&
      !installedOnProvenancePeerParis &&
      !installedOnResearchPeerParis*/) {
    console.log('no cc installed, creating...')

    try {
      await getAdminOrgs();
      const socketPath = process.env.DOCKER_SOCKET_PATH || '/var/run/docker.sock';
      const ccenvImage = 'hyperledger/fabric-ccenv:x86_64-1.1.0';
      const listOpts = { socketPath, method: 'GET', path: '/images/json' };
      const pullOpts = {
        socketPath, method: 'POST',
        path: url.format({ pathname: '/images/create', query: { fromImage: ccenvImage } })
      };

      const images = await new Promise((resolve, reject) => {
        const req = http.request(listOpts, (response) => {
          let data = '';
          response.setEncoding('utf-8');
          response.on('data', chunk => {data += chunk; });
          response.on('end', () => { resolve(JSON.parse(data)); })
        });
        req.on('error', reject); req.end();
      });

      const imageExists = images.some(i => i.RepoTags && i.RepoTags.some(tag =>
        tag === ccenvImage));

      if (!imageExists) {
        console.log('base container not present, pulling from docker hub');
        await new Promise((resolve, reject) => {
          const req = http.request(pullOpts, (response) => {
            response.on('data', () => { });
            response.on('end', () => { resolve(); });
          });
          req.on('error', reject); req.end()
        });
        console.log('base container downloaded');
      } else {
        console.log('base container present')
      }
    } catch (e) {
      console.log('fatal error pulling docker')
      console.log(e)

      process.exit(-1)
    }

    // install cc

    const installationPromises = [
    artistClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    brokerClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    artistClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    brokerClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),

    ];
    try {
      await Promise.all(installationPromises);
      await new Promise(resolve => { setTimeout(resolve, 10000); });
      console.log('successfully installed chaincode on Caldera')
    } catch (e) {
      console.log('fatal error install cc on Caldera');
      console.log(e);
      process.exit(-1);
    }

    //instantiate cc

    try {
      await artistClientFlorence.instantiate(config.chaincodeId, config.chaincodeVersion, {})

    } catch (e) {
      console.log('fatal err instantiating')
      console.log(e);
      process.exit(-1);
    }
  } else {
    console.log('cc already installed')
  }
}

(async () => {
  await createNetwork()
})();

module.exports.artistClientFlorence = artistClientFlorence
module.exports.artistClientParis = artistClientParis

module.exports.brokerClientFlorence = brokerClientFlorence
module.exports.brokerClientParis = brokerClientParis
/*
module.exports.insuranceClientFlorence = insuranceClientFlorence
module.exports.insuranceClientParis = insuranceClientParis

module.exports.ownerClientFlorence = ownerClientFlorence
module.exports.ownerClientParis = ownerClientParis

module.exports.provenanceClientFlorence = provenanceClientFlorence
module.exports.provenanceClientParis = provenanceClientParis

module.exports.researchClientFlorence = researchClientFlorence
module.exports.researchClientParis = researchClientParis*/

