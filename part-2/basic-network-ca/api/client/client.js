import hfc from 'fabric-client';
import utils from 'fabric-client/lib/utils';
import CAClient from 'fabric-ca-client';
import User from 'fabric-client/lib/User';
import http from 'http';
import { resolve } from 'path';
import url from 'url';
import Long from 'long';
import { snakeToCamelCase } from 'json-style-converter';

function marshalArgs(args) {
  if (!args) {
    return args
  }

  if (typeof args === 'string') {
    return [args];
  }

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
      console.log(mspId)

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

export default class CalderaClient {
  constructor(channelName, ordererConfig, peerConfig, caConfig, admin) {
    this._channelName = channelName;
    this._ordererConfig = ordererConfig;
    this._peerConfig = peerConfig;
    this._caConfig = caConfig;
    console.log('caConfig', this._caConfig)
    this._admin = admin;
    this._peers = [];
    this._client = new hfc();

    this._channel = this._client.newChannel(channelName);
    console.log(ordererConfig.pem)
    const orderer = this._client.newOrderer(ordererConfig.url, {
      pem: ordererConfig.pem,
      'ssl-target-name-override': ordererConfig.hostname
    });
    this._channel.addOrderer(orderer);
    console.log(orderer)
    console.log(this._channel)
    const defaultPeer = this._client.newPeer(peerConfig.url, {
      pem: peerConfig.pem,
      'ssl-target-name-override': peerConfig.hostname
    });
    this._peers.push(defaultPeer);
    this._channel.addPeer(defaultPeer);
    this._adminUser = null;
  }

  async login() {
    try {
      this._client.setStateStore(
        await hfc.newDefaultKeyValueStore({
          path:  `./${this._peerConfig.hostname}`
        }));
      this._adminUser = await getSubmitter(
        this._client, `${this._caConfig.hostname}-admin`, `${this._caConfig.hostname}-adminpw`, this._caConfig);
    } catch (e) {
      console.log('failed to enroll user', e.message)
      throw e
    }
  }

  async getOrgAdmin() {
    console.log('attempting createUser')
    return this._client.createUser({
      username: `Admin@${this._peerConfig.hostname}`,
      mspid: this._caConfig.mspId,
      cryptoContent: {
        privateKeyPEM: this._admin.key,
        signedCertPEM: this._admin.cert
      }
    })
  }

  async initialize() {
    try {
      await this._channel.initialize();
    } catch (e) {
      console.log('fail to initialize chain')
      throw e
    }
  }

  async checkChannelMembership() {
    console.log("checking channel membership")
    try {
      console.log('querying channels')
      console.log('input', this._peers[0]);
      // this._client.setAdminSigningIdentity(this._admin.key, this._admin.cert, this._caConfig.mspId)
      const { channels } = await this._client.queryChannels(this._peers[0], false);
      console.log('channels', {channels})
      if (!Array.isArray(channels)) {
        return false;
      }
      console.log(channels.some(({channel_id}) => channel_id === this._channelName))
      return channels.some(({channel_id}) => channel_id === this._channelName);
    } catch (e) {
      console.log(':(')
      return false;
    }
  }

  async createChannel(envelope) {
    const txId = this._client.newTransactionID();
    const channelConfig = this._client.extractChannelConfig(envelope);
    const signature = this._client.signChannelConfig(channelConfig);
    const request = {
      name: this._channelName,
      orderer: this._channel.getOrderers()[0],
      config: channelConfig,
      signatures: [signature],
      txId
    };
    const response = await this._client.createChannel(request);

    await new Promise(resolve => {
      setTimeout(resolve, 5000);
    });
    return response;
  }

  async joinChannel() {
    try {
      const genesisBlock = await this._channel.getGenesisBlock({
        txId: this._client.newTransactionID()
      });
      const request = {
        targets: this._peers,
        txId: this._client.newTransactionID(),
        block: genesisBlock
      }
      await this._channel.joinChannel(request)
    } catch (e) {
      console.log("failed join join peer to channel")
      throw e
    }
  }

  async checkInstalled(chaincodeId, chaincodeVersion, chaincodePath) {
    let { chaincodes } = await this._channel.queryInstantiatedChaincodes();
    if (!Array.isArray(chaincodes)) {
      return false
    }

    return chaincodes.some(cc =>
      cc.name === chaincodeId &&
      cc.path === chaincodePath &&
      cc.version === chaincodeVersion);
  }

  async install(chaincodeId, chaincodeVersion, chaincodePath) {
    const request = {
      targets: this._peers,
      chaincodePath,
      chaincodeId,
      chaincodeVersion
    };
    let results;
    try {

      results = await this._client.installChaincode(request);
    } catch (e) {
      console.log(request.chaincodeVersion)
      console.log('err sending install proposal to peer')
      throw e;
    }
    const proposalResponses = results[0];
    const good = proposalResponses.every(pr => pr.response && pr.response.status == 200);
    return good;
  }

  async instantiate(chaincodeId, chaincodeVersion, ...args) {
    let proposalResponses, proposal;
    const txId = this._client.newTransactionID();
    try {
      const request = {
        chaincodeType: 'golang',
        chaincodeId,
        chaincodeVersion,
        fcn: 'init',
        // for future contract seeds
        // args: marshalArgs(args),
        txId
      };
      const results = await this._channel.sendInstantiateProposal(request);
      proposalResponses = results[0];
      proposal = results[1];

      let good = proposalResponses.every(pr => pr.response && pr.response.status == 200);

      if (!good) {
        throw new Error('proposal to instantiate rejected');
      }
    } catch (e) {
      throw e;
    }

    try {
      const request = {
        proposalResponses,
        proposal
      };
      const deployId = txId.getTransactionID();
      await this._channel.sendTransaction(request);
    } catch (e) {
      throw e
    }
  }

  async invoke(chaincodeId, chaincodeVersion, fcn, ...args) {
    let proposalResponses, proposal;
    console.log(args)
    console.log(...args)
    const txId = this._client.newTransactionID();
    try {
      const request = {
        chaincodeId,
        chaincodeVersion,
        fcn,
        args: marshalArgs(args),
        txId
      };
      const results = await this._channel.sendTransactionProposal(request);
      proposalResponses = results[0];
      proposal = results[1];

      const good = proposalResponses.every(pr => pr.response && pr.response.status == 200);

      if (!good) {
        throw new Error('proposal rejected by peer')
      }
    } catch (e) {
      throw e;
    }

    try {
      const request = {
        proposalResponses,
        proposal
      }


      try {

      await this._channel.sendTransaction(request);
      const payload = proposalResponses[0].response.payload;
      return unmarshalResult([payload]);

      } catch (e) {
        throw e;
      }
    } catch (e) {
      throw e
    }
  }

  async query(chaincodeId, chaincodeVersion, fcn, ...args) {
    const request = {
      chaincodeId,
      chaincodeVersion,
      fcn,
      args: marshalArgs(args),
      txId: this._client.newTransactionID()
    };
    return unmarshalResult(await this._channel.queryByChaincode(request))
  }

  async getBlocks(input) {
    const {
      height
    } = await this._channel.queryInfo();
    let blockCount;
    if (height.comp(input) > 0 ) {
      blockCount = input;
    } else {
      blockCount = height;
    }
    if (typeof blockCount === 'number') {
      blockCount = Long.fromNumber(blockCount, height.unsigned);
    } else if (typeof blockCount === 'string') {
      blockCount = Long.fromString(blockCount, height.unsigned);
    }
    blockCount = blockCount.toNumber();
    const queryBlock = this._channel.queryBlock.bind(this._channel);
    const blockPromises = {};
    blockPromises[Symbol.iterator] = function* () {
      for (let i = 1; i <= blockCount; i++) {
        yield queryBlock(height.sub(i).toNumber());
      }
    };
    const blocks = await Promise.all([...blockPromises]);
    return blocks.map(unmarshalBlock)
  }
}
