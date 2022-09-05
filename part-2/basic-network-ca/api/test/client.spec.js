import chai from 'chai'
import path from 'path'
import CalderaClient from '../client/client'
import config from '../config'
const should = chai.should();

describe('CalderaClient', () => {
  describe('#constructor()', () => {
    it('requires 5 arguments, the first a string and last 4 being objects', () => {
      () => {
        new CalderaClient();
      }.should.throw(Error);

      () => {
        new CalderaClient('foo')
      }.should.throw(Error)

      () => {
        new CalderaClient('caldera', {}, {}, {}, {})
      }.should.not.throw(Error)
    })
  })

  describe('#login', () => {
    let calderaClient

    beforeEach(() => {
      calderaClient = new CalderaClient{
        config.channelName,
        config.orderer0,
        config.artistOrg['florence-peer'],
        config.artistOrg.ca,
        config.companyOrg.admin
      }
    });

    it('changes this._adminuser', () => {
      calderaClient.login()
    })
  })
})