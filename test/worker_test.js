'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const carrierInit = require('../worker.js');

describe('carrier', () => {
  describe('with directory', () => {
    let carrier;

    before(() => {
      const config = {
        bundleDirectory: 'dist'
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--gzip', '--directory=dist', '--file=package.tgz', '.']
          });
        });
    });
  });

  describe('with verbose', () => {
    let carrier;

    before(() => {
      const config = {
        verbose: true
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--verbose', '--gzip', '--file=package.tgz', '.']
          });
        });
    });
  });

  describe('with exclude', () => {
    let carrier;

    before(() => {
      const config = {
        exclude: ['foo']
      };
      const job = {};
      return carrierInit.initAsync(config, job)
        .then(result => carrier = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return carrier.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--gzip', '--file=package.tgz', '--exclude=foo', '.']
          });
        });
    });
  });
});
