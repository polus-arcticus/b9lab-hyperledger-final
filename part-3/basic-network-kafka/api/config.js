import { readFileSync } from 'fs';
import { resolve } from 'path';
import { join } from 'path';

export default {
  channelName: 'caldera',
  channelConfig: readFileSync(resolve(__dirname, './Caldera.tx')),
  chaincodeId: 'caldera',
  chaincodeVersion: 'v1',
  chaincodePath: 'caldera',
  'orderer0': {
    hostname: 'orderer0',
    url: 'grpc://orderer0:7050'
  },
  artistOrg: {
    "peer-florence": {
      hostname: 'artist-peer-florence',
      url: 'grpc://artist-peer-florence:7051',
      //pem: readFileSync(resolve('./certs', 'artistOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'artist-peer-paris',
      url: 'grpc://artist-peer-paris:7051',
      //pem: readFileSync(resolve('./certs', 'artistOrg.pem')).toString()
    },
    ca: {
      hostname: 'artist-ca',
      url: 'http://artist-ca:7054',
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
      url: 'grpc://broker-peer-florence:7051',
      //pem: readFileSync(resolve('./certs', 'brokerOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'broker-peer-paris',
      url: 'grpc://broker-peer-paris:7051',
      //pem: readFileSync(resolve('./certs', 'brokerOrg.pem')).toString()
    },
    ca: {
      hostname: 'broker-ca',
      url: 'http://broker-ca:7054',
      mspId: 'BrokerOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@broker-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@broker-org-cert.pem')).toString()
    }
  },
/*  insuranceOrg: {
    "peer-florence": {
      hostname: 'insurance-peer-florence',
      url: 'grpcs://insurance-peer-florence:7051',
      //pem: readFileSync(resolve('./certs', 'insuranceOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'insurance-peer-paris',
      url: 'grpcs://insurance-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'insuranceOrg.pem')).toString()
    },
    ca: {
      hostname: 'insurance-ca',
      url: 'https://insurance-ca:7054',
      mspId: 'InsuranceOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@insurance-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@insurance-org-cert.pem')).toString()
    }
  },
  ownerOrg: {
    "peer-florence": {
      hostname: 'owner-peer-florence',
      url: 'grpcs://owner-peer-florence:7051',
      pem: readFileSync(resolve('./certs', 'ownerOrg.pem')).toString()
    },
    "peer-paris": {
      hostname: 'owner-peer-paris',
      url: 'grpcs://owner-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'ownerOrg.pem')).toString()

    },
    ca: {
      hostname: 'owner-ca',
      url: 'https://owner-ca:7054',
      mspId: 'OwnerOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@owner-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@owner-org-cert.pem')).toString()
    }
  },
  provenanceOrg: {
    "peer-florence": {
      hostname: 'provenance-peer-florence',
      url: 'grpcs://provenance-peer-florence:7051',
      pem: readFileSync(resolve('./certs', 'provenanceOrg.pem')).toString()

    },
    "peer-paris": {
      hostname: 'provenance-peer-paris',
      url: 'grpcs://provenance-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'provenanceOrg.pem')).toString()

    },
    ca: {
      hostname: 'provenance-ca',
      url: 'https://provenance-ca:7054',
      mspId: 'ProvenanceOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@provenance-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@provenance-org-cert.pem')).toString()
    }
  },
  researchOrg: {
    "peer-florence": {
      hostname: 'research-peer-florence',
      url: 'grpcs://research-peer-florence:7051',
      pem: readFileSync(resolve('./certs', 'researchOrg.pem')).toString()

    },
    "peer-paris": {
      hostname: 'research-peer-paris',
      url: 'grpcs://research-peer-paris:7051',
      pem: readFileSync(resolve('./certs', 'researchOrg.pem')).toString()
    },
    ca: {
      hostname: 'research-ca',
      url: 'https://research-ca:7054',
      mspId: 'ResearchOrgMSP'
    },
    admin: {
      key: readFileSync(resolve('./certs', 'Admin@research-org-key.pem')).toString(),
      cert: readFileSync(resolve('./certs', 'Admin@research-org-cert.pem')).toString()
    }
  }
*/
}