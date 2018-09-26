import { readFileSync } from 'fs';
import { resolve } from 'path';
import { join } from 'path';

export default {
  channelName: 'caldera',
  channelConfig: readFileSync(resolve(__dirname, './Caldera.tx')),
  chaincodeId: 'caldera',
  chaincodeVersion: 'v1',
  chaincodePath: 'caldera',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpcs://orderer0:7050',
    pem: readFileSync(resolve('./certs', 'ordererOrg.pem')).toString()
  },
  artistOrg: {
    "peer-florence": {
      hostname: 'artist-peer-florence',
      url: 'grpcs://artist-peer-florence:7051',
      pem: readFileSync(resolve('./certs', 'artistOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'artist-peer-paris',
      url: 'grpcs://artist-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'artistOrg.pem')).toString()
    },
    ca: {
      hostname: 'artist-ca',
      url: 'https://artist-ca:7054',
      mspId: 'ArtistOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@artist-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@artist-org-cert.pem')).toString()
    }
  },
  brokerOrg: {
    "peer-florence": {
      hostname: 'broker-peer-florence',
      url: 'grpcs://broker-peer-florence:7051',
      pem: readFileSync(resolve('./certs', 'brokerOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'broker-peer-paris',
      url: 'grpcs://broker-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'brokerOrg.pem')).toString()
    },
    ca: {
      hostname: 'broker-ca',
      url: 'https://broker-ca:7054',
      mspId: 'BrokerOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@broker-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@broker-org-cert.pem')).toString()
    }
  }
}
