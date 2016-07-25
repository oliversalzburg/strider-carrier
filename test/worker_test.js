'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const carrierInit = require('../worker.js');

describe('carrier', () => {
  describe('host parsing - host only', () => {
    let carrier;

    before(() => {
      const config = {
        source: 'package.tgz',
        target: '/tmp/package.tgz',
        hosts: [
          'my.amazing.host'
        ]
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected scp command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'scp',
            args: ['package.tgz', 'my.amazing.host:/tmp/package.tgz']
          });
        });
    });
  });
  describe('host parsing - host with username', () => {
    let carrier;

    before(() => {
      const config = {
        source: 'package.tgz',
        target: '/tmp/package.tgz',
        hosts: [
          'user@my.amazing.host'
        ]
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected scp command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'scp',
            args: ['package.tgz', 'user@my.amazing.host:/tmp/package.tgz']
          });
        });
    });
  });
  describe('host parsing - host with port', () => {
    let carrier;

    before(() => {
      const config = {
        source: 'package.tgz',
        target: '/tmp/package.tgz',
        hosts: [
          'my.amazing.host:1234'
        ]
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected scp command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'scp',
            args: ['-P', '1234', 'package.tgz', 'my.amazing.host:/tmp/package.tgz']
          });
        });
    });
  });
});
