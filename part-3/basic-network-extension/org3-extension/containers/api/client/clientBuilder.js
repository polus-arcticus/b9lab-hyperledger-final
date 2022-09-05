import CalderaClient from './client';
import config from '../config';
import url from 'url';
import http from 'http';
import { resolve } from 'path';
process.env.GOPATH = resolve(__dirname, '../chaincode')


function getAdminOrgs() {
  return Promise.all([
    org3Client.getOrgAdmin(),
    ]);
}
const org3Client = new CalderaClient(
  config.channelName,
  config.orderer0,
  config.ownerOrg["peer0.owner-org"],
  config.ownerOrg.ca,
  config.ownerOrg.admin
  );

async function extendNetwork() {
  try {
    await Promise.all([
      org3Client.login()
      ])
  } catch (e) {
    console.log('failed to login')
    console.log(e)
    process.exit(-1)
  }

  try {
    await getAdminOrgs();
    await Promise.all([
      org3Client.joinChannel()
      ])
  } catch (e) {
    console.log('failed to joinchannel')
    console.log(e)
    process.exit(-1)
  }

  try {
    await Promise.all([
      org3Client.initialize()
      ])
  } catch (e) {
    console.log('error initializing client')
    console.log(e)
    process.exit(-1)
  }

  let installedOnOrg3Client;

  try {
    await getAdminOrgs();
    installedOnOrg3Client = await org3Client.checkInstalled(config.chaincodeId, config.chaincodeVersion, config.chaincodePath);
  } catch (e) {
    console.log('failed getting installation status')
    console.log(e)
    process.exit(-1)
  }

  if (!installedOnOrg3Client) {
    console.log('cc not installed, installing')

    // install cc
    const installationPromises = [
    org3Client.install(config.chaincodeId, config.chaincodeVersion, config.chaincodePath),
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
  } else {
    console.log('cc already installed')
  }
}

(async () => {
  await extendNetwork()
})()

module.exports.org3Client = org3Client