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
    ownerClient0.getOrgAdmin(),
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
const ownerClient0 = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.ownerOrg['peer0.owner-org'],
  config.ownerOrg.ca,
  config.ownerOrg.admin
);


// Workhorse function to build out client with relevant configuration
async function createNetwork() {
  try {
    // await for clients to build their key-value stores in the api container fs
    // and enroll an admin user admin:adminpw with its certificate authority
    await Promise.all([
      ownerClient0.login(),

      ]);
  } catch (e) {
    console.log(e);
    process.exit(-1);
  }

  try {
    // await all clients to create a User under its mspid with admin level Orgmsp key and cert
    await getAdminOrgs();
    // checks our base peer (with its trusty 7050:7050 port mapping) for the existence of accessible channels
    if (!(await ownerClient0.checkChannelMembership())) {
      console.log('channel not found, creating Caldera channel');
      // generates a txId, pulls our channel configuration envelope generates a channel signature
      // forms a request object to be sent to the orderer to request channel creation
      const createChannelResponse = await ownerClient0.createChannel(config.channelConfig);
      if (createChannelResponse.status === 'SUCCESS') {
        console.log('caldera channel created!');
        console.log('attempting to join peers');
        await Promise.all([
          // wait for all clients to fetch genesisblock, and send a joinchannel request
          ownerClient0.joinChannel(),
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
          ownerClient0.initialize(),
      ])
  } catch (e) {
    console.log('error initializing client')
    console.log(e)
    process.exit(-1)
  }

  //chaincode install

  let installedOnArtistPeerFlorence

  try {
    // query instantiated chaincodes on the channel object in each client
    await getAdminOrgs();
    installedOnArtistPeerFlorence = await ownerClient0.checkInstalled(
      config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
  } catch (e) {
    console.log('failed getting installation status')
    console.log(e);
    process.exit(-1);
  }

  if (!installedOnArtistPeerFlorence) {
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
    ownerClient0.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
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
      await ownerClient0.instantiate(config.chaincodeId, config.chaincodeVersion, {})

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
module.exports.ownerClient0 = ownerClient0



