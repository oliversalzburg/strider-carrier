'use strict';

const Promise = require('bluebird');

const debug = require('debug')('strider-carrier:worker');
const ExtensionConfigurationError = require('strider-modern-extensions').errors.ExtensionConfigurationError;
const toStriderProxy = require('strider-modern-extensions').toStriderProxy;

class CarrierPhaseWorker {
  constructor(config, job) {
    debug('Constructing phase worker for strider-carrier…');

    this.config = config || {};
    this.job = job;
  }

  //noinspection JSUnusedGlobalSymbols
  deploy(context) {
    debug('Starting transfer process...');
    context.comment('Starting transfer process…');

    const contextCmd = Promise.promisify(context.cmd);

    const hosts = parseHosts(this.config.hosts);

    return Promise.map(hosts, host => {
      let targetString = `${host.host}:${this.config.target}`;
      if (host.user) {
        targetString = `${host.user}@${targetString}`;
      }

      const args = [];

      // Add remote port as needed.
      if (host.port) {
        args.push('-P', host.port);
      }

      // Disable strict host key checking (known_hosts) if it was explicitly set to false.
      if (this.config.strictHostKeyChecking === false) {
        args.push('-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null');
      }

      if(this.config.identity) {
        args.push('-i', this.config.identity);
      }

      // Add the source and target file locations.
      args.push(this.config.source);
      args.push(targetString);

      return contextCmd({
        command: 'scp',
        args: args
      })
        .then(() => {
          context.comment(`Package carried to ${targetString}.`);
        });
    });
  }
}

function parseHosts(hosts) {
  return hosts.map(target => {
    const matches = target.match(/(?:([\w-]+)@)?([\w.-]+)(?::(\d+))?/);
    return {
      user: matches[1],
      host: matches[2],
      port: matches[3]
    };
  });
}

class CarrierInit {
  //noinspection JSUnusedGlobalSymbols
  init(config, job) {
    debug('Initializing strider-carrier…');

    if (!config.source) {
      throw new ExtensionConfigurationError('source', 'The configuration is expected to contain a \'source\' member that contains the path pointing to the file to copy.');
    }
    if (!config.target) {
      throw new ExtensionConfigurationError('target', 'The configuration is expected to contain a \'target\' member that contains the path pointing to where to copy the file to on the remote host(s).');
    }
    if (!config.hosts || !config.hosts.length) {
      throw new ExtensionConfigurationError('hosts', 'The configuration is expected to contain a \'hosts\' member that contains an array of hosts to which to copy the file. The format should be \'[user@]host[:port]\'.');
    }

    return Promise.resolve(toStriderProxy(new CarrierPhaseWorker(config, job)));
  }
}

module.exports = toStriderProxy(new CarrierInit());
