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
/*    insuranceClientFlorence.getOrgAdmin(),
    ownerClientFlorence.getOrgAdmin(),
    provenanceClientFlorence.getOrgAdmin(),
    researchClientFlorence.getOrgAdmin(),
    insuranceClientParis.getOrgAdmin(),
    ownerClientParis.getOrgAdmin(),
    provenanceClientParis.getOrgAdmin(),
    researchClientParis.getOrgAdmin(),*/

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
  config['orderer-org'],
  config['artist-org']['peer1-artist-org'],
  config['artist-org']['rca-artist-org'],
  config['artist-org'].admin
);

const artistClientParis = new CalderaClient(
  config.channelName,
  config['orderer-org'],
  config['artist-org']['peer2-artist-org'],
  config['artist-org']['rca-artist-org'],
  config['artist-org'].admin
);

const brokerClientFlorence = new CalderaClient(
  config.channelName,
  config['orderer-org'],
  config['broker-org']['peer1-broker-org'],
  config['broker-org']['rca-broker-org'],
  config['broker-org'].admin
);

const brokerClientParis = new CalderaClient(
  config.channelName,
  config['orderer-org'],
  config['broker-org']['peer2-broker-org'],
  config['broker-org']['rca-broker-org'],
  config['broker-org'].admin
);

/*const insuranceClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.insuranceOrg['peer-florence'],
  config.insuranceOrg.ca,
  config.insuranceOrg.admin
);

const insuranceClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.insuranceOrg['peer-paris'],
  config.insuranceOrg.ca,
  config.insuranceOrg.admin
);

const ownerClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.ownerOrg['peer-florence'],
  config.ownerOrg.ca,
  config.ownerOrg.admin
);

const ownerClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.ownerOrg['peer-paris'],
  config.ownerOrg.ca,
  config.ownerOrg.admin
);

const provenanceClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.provenanceOrg['peer-florence'],
  config.provenanceOrg.ca,
  config.provenanceOrg.admin
);

const provenanceClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.provenanceOrg['peer-paris'],
  config.provenanceOrg.ca,
  config.provenanceOrg.admin
);

const researchClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.researchOrg['peer-florence'],
  config.researchOrg.ca,
  config.researchOrg.admin
);

const researchClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.researchOrg['peer-paris'],
  config.researchOrg.ca,
  config.researchOrg.admin
);*/

async function createNetwork() {
  try {
    await Promise.all([
      artistClientFlorence.login(),
/*      provenanceClientFlorence.login(),
      provenanceClientParis.login(),*/
      artistClientParis.login(),
      brokerClientFlorence.login(),
      brokerClientParis.login(),
/*      insuranceClientFlorence.login(),
      insuranceClientParis.login(),
      ownerClientFlorence.login(),
      ownerClientParis.login(),
      researchClientFlorence.login(),
      researchClientParis.login(),*/
      ]);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }

  try {
    await getAdminOrgs();
    if (!(await artistClientFlorence.checkChannelMembership())) {
      console.log('channel not found, creating Caldera channel');
      console.log('config', config.channelConfig)
      const createChannelResponse = await artistClientFlorence.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('caldera channel created!');
        console.log('attempting to join peers');
        await Promise.all([
          artistClientFlorence.joinChannel(),
/*          provenanceClientFlorence.joinChannel(),
          provenanceClientParis.joinChannel(),*/
          artistClientParis.joinChannel(),
          brokerClientFlorence.joinChannel(),
          brokerClientParis.joinChannel(),
/*          insuranceClientFlorence.joinChannel(),
          insuranceClientParis.joinChannel(),
          ownerClientFlorence.joinChannel(),
          ownerClientParis.joinChannel(),
          researchClientFlorence.joinChannel(),
          researchClientParis.joinChannel(),*/
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
/*          provenanceClientFlorence.initialize(),
          provenanceClientParis.initialize(),*/
          artistClientFlorence.initialize(),
          artistClientParis.initialize(),
          brokerClientFlorence.initialize(),
          brokerClientParis.initialize(),
/*          insuranceClientFlorence.initialize(),
          insuranceClientParis.initialize(),
          ownerClientFlorence.initialize(),
          ownerClientParis.initialize(),
          researchClientFlorence.initialize(),
          researchClientParis.initialize(),*/
      ])
  } catch (e) {
    console.log('error initializing client')
    console.log(e)
    process.exit(-1)
  }

  //chaincode install

  let installedOnArtistPeerFlorence, installedOnBrokerPeerFlorence /*installedOnInsurancePeerFlorence*/
  // let installedOnOwnerPeerFlorence, installedOnProvenancePeerFlorence, installedOnResearchPeerFlorence
  let installedOnArtistPeerParis, installedOnBrokerPeerParis //installedOnInsurancePeerParis
  //let installedOnOwnerPeerParis, installedOnProvenancePeerParis, installedOnResearchPeerParis

  try {
    await getAdminOrgs();
    installedOnArtistPeerFlorence = await artistClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerFlorence = await brokerClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
/*    installedOnInsurancePeerFlorence = await insuranceClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnOwnerPeerFlorence = await ownerClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnProvenancePeerFlorence = await provenanceClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnResearchPeerFlorence = await researchClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);*/
    installedOnArtistPeerParis = await artistClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerParis = await brokerClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
/*    installedOnInsurancePeerParis = await insuranceClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnOwnerPeerParis = await ownerClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnProvenancePeerParis = await provenanceClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnResearchPeerParis = await researchClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);*/
  } catch (e) {
    console.log('failed getting installation status')
    console.log(e);
    process.exit(-1);
  }

  if (!installedOnArtistPeerFlorence &&
      !installedOnBrokerPeerFlorence &&
/*      !installedOnInsurancePeerFlorence &&
      !installedOnOwnerPeerFlorence &&
      !installedOnProvenancePeerFlorence &&
      !installedOnResearchPeerFlorence &&*/
      !installedOnArtistPeerParis &&
      !installedOnBrokerPeerParis
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
/*    insuranceClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    ownerClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    provenanceClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    researchClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),*/

    artistClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    brokerClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
/*    insuranceClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    ownerClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    provenanceClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    researchClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),*/

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

