'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.use(sinonChai);

const bundlerInit = require('../worker.js');

describe('bundler', () => {
  describe('with directory', () => {
    let bundler;

    before(() => {
      const config = {
        bundleDirectory: 'dist'
      };
      const job = {};
      return bundlerInit.initAsync(config, job)
        .then(result => bundler = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return bundler.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--gzip', '--directory=dist', '--file=package.tgz', '.']
          });
        });
    });
  });

  describe('with verbose', () => {
    let bundler;

    before(() => {
      const config = {
        verbose: true
      };
      const job = {};
      return bundlerInit.initAsync(config, job)
        .then(result => bundler = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return bundler.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--verbose', '--gzip', '--file=package.tgz', '.']
          });
        });
    });
  });

  describe('with exclude', () => {
    let bundler;

    before(() => {
      const config = {
        exclude: ['foo']
      };
      const job = {};
      return bundlerInit.initAsync(config, job)
        .then(result => bundler = result);
    });

    it('should run the expected tar command', () => {
      let contextCmd = sinon.stub();
      contextCmd.onFirstCall().callsArg(1);

      const context = {
        comment: Function.prototype,
        cmd: contextCmd
      };

      return bundler.deployAsync(context)
        .then(() => {
          expect(contextCmd).to.have.been.calledWithMatch({
            command: 'tar',
            args: ['--create', '--gzip', '--file=package.tgz', '--exclude=foo', '.']
          });
        });
    });
  });
});
