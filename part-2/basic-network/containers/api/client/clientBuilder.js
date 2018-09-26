/************************************************
Adding a Channel to our network with fabric-node-sdk
- creating a client instance
-  -  crypto suite
-  -  setting admin with fabric-ca
-  -  enrolling a user context
-  -  creating a channel
-  -  joining peers
-  -  installing/instantiating chaincode
-  -  invoke/query chaincode
************************************************/

import CalderaClient from './client';
import config from '../config';
import url from 'url';
import http from 'http';
import { resolve } from 'path';
process.env.GOPATH = resolve(__dirname, '../chaincode')

/*function unmarshalBlock(block) {
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
}*/

function getAdminOrgs() {
  return Promise.all([
    artistClientFlorence.getOrgAdmin(),
    artistClientParis.getOrgAdmin(),
    brokerClientFlorence.getOrgAdmin(),
    brokerClientParis.getOrgAdmin()
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

// Our client object (pastiche from Ishan Gulhane Ibm/blockchain insurance app)
// our configuration is specified through a config.js object
const artistClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.artistOrg['peer-florence'],
  config.artistOrg.ca,
  config.artistOrg.admin
);

const artistClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.artistOrg['peer-paris'],
  config.artistOrg.ca,
  config.artistOrg.admin
);

const brokerClientFlorence = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.brokerOrg['peer-florence'],
  config.brokerOrg.ca,
  config.brokerOrg.admin
);

const brokerClientParis = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.brokerOrg['peer-paris'],
  config.brokerOrg.ca,
  config.brokerOrg.admin
);


// Workhorse function to build out client with relevant configuration
async function createNetwork() {
  try {
    // await for clients to build their key-value stores in the api container fs
    // and enroll an admin user admin:adminpw with its certificate authority
    await Promise.all([
      artistClientFlorence.login(),
      artistClientParis.login(),
      brokerClientFlorence.login(),
      brokerClientParis.login()
      ]);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }

  try {
    // await all clients to create a User under its mspid with admin level Orgmsp key and cert
    await getAdminOrgs();
    // checks our base peer (with its trusty 7050:7050 port mapping) for the existence of accessible channels
    if (!(await artistClientFlorence.checkChannelMembership())) {
      console.log('channel not found, creating Caldera channel');
      // generates a txId, pulls our channel configuration envelope generates a channel signature
      // forms a request object to be sent to the orderer to request channel creation
      const createChannelResponse = await artistClientFlorence.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('caldera channel created!');
        console.log('attempting to join peers');
        await Promise.all([
          // wait for all clients to fetch genesisblock, and send a joinchannel request
          artistClientFlorence.joinChannel(),
          artistClientParis.joinChannel(),
          brokerClientFlorence.joinChannel(),
          brokerClientParis.joinChannel(),
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
          // wait for all clients to initialize the channel object with the MSP
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

  let installedOnArtistPeerFlorence, installedOnBrokerPeerFlorence
  let installedOnArtistPeerParis, installedOnBrokerPeerParis

  try {
    // query instantiated chaincodes on the channel object in each client
    await getAdminOrgs();
    installedOnArtistPeerFlorence = await artistClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerFlorence = await brokerClientFlorence.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnArtistPeerParis = await artistClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
    installedOnBrokerPeerParis = await brokerClientParis.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
  } catch (e) {
    console.log('failed getting installation status')
    console.log(e);
    process.exit(-1);
  }

  if (!installedOnArtistPeerFlorence &&
      !installedOnArtistPeerParis &&
      !installedOnBrokerPeerFlorence &&
      !installedOnBrokerPeerParis) {
    console.log('no cc installed, creating...')
    // create the chaincode sandbox using the cc-env image applied in this container
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
    // install chaincodes on each peer
    artistClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    brokerClientFlorence.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    artistClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
    brokerClientParis.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath)
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
      // instantiate the chaincode using our trusty peers channel object
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
// auto exec our workhorse
(async () => {
  await createNetwork()
})();
// export our clients for use in REST API
module.exports.artistClientFlorence = artistClientFlorence
module.exports.artistClientParis = artistClientParis

module.exports.brokerClientFlorence = brokerClientFlorence
module.exports.brokerClientParis = brokerClientParis


