'use strict';

const Promise = require('bluebird');

const debug = require('debug')('strider-carrier:worker');

function toStriderProxy(instance) {
  const functionsInInstance = Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(propertyName => {
    return typeof instance[propertyName] === 'function' && propertyName !== 'constructor';
  });

  functionsInInstance.forEach(functionInInstance => {
    instance[`${functionInInstance}Async`] = instance[functionInInstance];
    instance[functionInInstance] = function () {
      const args = Array.from(arguments);
      const done = args.pop();
      return instance[`${functionInInstance}Async`].apply(instance, args)
        .then(result => done(null, result))
        .catch(error => done(error));
    };
    Object.defineProperty(instance[functionInInstance], 'length', {
      value: instance[`${functionInInstance}Async`].length
    });
  });

  return instance;
}

class CarrierPhaseWorker {
  constructor(config, job) {
    debug('Constructing phase worker for strider-carrier…');

    this.config = config || {};
    this.job = job;

    // Example: Setting an environment variable
    this.env = {
      'BUNDLER_ACTIVE': true
    };

    // Example: Static command definition for a phase
    this.environment = 'echo This job will be processed by strider-carrier';
  }

  // Run this function in the deploy phase.
  deploy(context) {
    debug('Starting bundling process…');
    context.comment('Starting bundling process…');

    const contextCmd = Promise.promisify(context.cmd);

    const args = [];
    // Create an archive
    args.push('--create');
    // Set verbose as requested.
    if (this.config.verbose) {
      args.push('--verbose');
    }
    // Compress it
    args.push('--gzip');
    // If a directory was given, archive that (otherwise cwd)
    if (this.config.bundleDirectory) {
      args.push(`--directory=${this.config.bundleDirectory}`);
    }
    // Set the output filename
    args.push('--file=package.tgz');

    if (this.config.exclude && this.config.exclude.length) {
      this.config.exclude.forEach(exclude => {
        args.push(`--exclude=${exclude}`);
      });
    }

    args.push('.');

    return contextCmd({
      command: 'tar',
      args: args
    })
      .then(() => {
        context.comment('Bundle created as package.tgz.');
      });
  }
}

class CarrierInit {
  init(config, job) {
    debug('Initializing strider-carrier…');
    return Promise.resolve(toStriderProxy(new CarrierPhaseWorker(config, job)));
  }
}

module.exports = toStriderProxy(new CarrierInit());
