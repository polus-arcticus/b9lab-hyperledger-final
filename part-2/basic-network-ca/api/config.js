import { readFileSync } from 'fs';
import { resolve } from 'path';
import { join } from 'path';

export default {
  channelName: 'caldera',
  channelConfig: readFileSync(resolve('./', 'channel.tx')),
  chaincodeId: 'caldera',
  chaincodeVersion: 'v1',
  chaincodePath: 'caldera',
  "orderer-org": {
    hostname: 'orderer1-orderer-org',
    url: 'grpcs://orderer1-orderer-org:7050',
    pem: readFileSync(resolve('./certs', 'orderer-org-ca-cert.pem')).toString()
  },
  'artist-org': {
    "peer1-artist-org": {
      hostname: 'peer1-artist-org',
      url: 'grpcs://peer1-artist-org:7051',
      pem: readFileSync(resolve('./certs', 'artist-org-ca-cert.pem')).toString()
    },
    "peer2-artist-org": {
      hostname: 'peer2-artist-org',
      url: 'grpcs://peer2-artist-org:7051',
      pem: readFileSync(resolve('./certs', 'artist-org-ca-cert.pem')).toString()
    },
    "rca-artist-org": {
      hostname: 'rca-artist-org',
      url: 'https://rca-artist-org:7054',
      mspId: 'artist-orgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@artist-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@artist-org-cert.pem')).toString()
    }
  },
  'broker-org': {
    "peer1-broker-org": {
      hostname: 'peer1-broker-org',
      url: 'grpcs://peer1-broker-org:7051',
      pem: readFileSync(resolve('./certs', 'broker-org-ca-cert.pem')).toString()
    },
    "peer2-broker-org": {
      hostname: 'peer2-broker-org',
      url: 'grpcs://peer2-broker-org:7051',
      pem: readFileSync(resolve('./certs', 'broker-org-ca-cert.pem')).toString()
    },
    'rca-broker-org': {
      hostname: 'rca-broker-org',
      url: 'https://rca-broker-org:7054',
      mspId: 'broker-orgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@broker-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@broker-org-cert.pem')).toString()
    }
  }
}