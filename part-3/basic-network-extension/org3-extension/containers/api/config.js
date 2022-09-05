import { readFileSync } from 'fs';
import { resolve } from 'path';
import { join } from 'path';

export default {
  channelName: 'caldera',
  channelConfig: readFileSync(resolve(__dirname, './Caldera.tx')),
  chaincodeId: 'caldera',
  chaincodeVersion: 'v2',
  chaincodePath: 'caldera',
  orderer0: {
    hostname: 'orderer0',
    url: 'grpcs://orderer0:7050',
    pem: readFileSync(resolve('./certs', 'ordererOrg.pem')).toString()
  },
  ownerOrg: {
    "peer0.owner-org": {
      hostname: 'peer0.owner-org',
      url: 'grpcs://peer0.owner-org:7051',
      pem: readFileSync(resolve('./certs', 'ownerOrg.pem')).toString()
    },
    ca: {
      hostname: 'org3-ca',
      url: 'https://org3-ca:7054',
      mspId: 'OwnerOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@owner-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@owner-org-cert.pem')).toString()
    }
  }
}