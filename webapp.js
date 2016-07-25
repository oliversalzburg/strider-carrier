'use strict';

module.exports = {
  config: {
    source: {type: String, default: 'package.tgz'},
    target: {type: String, default: '/tmp/package.tgz'},
    hosts: [
      {type: String}
    ],
    strictHostKeyChecking: {type: Boolean},
    identity: {type: String}
  }
};
