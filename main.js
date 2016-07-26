/* global module */

'use strict';

// include npm packages
var async = require('async'),
    Promise = require('promise');

// include modules libraries
var check = require('./lib/check'),
    bb2Helpers = require('./lib/bb2Helpers');

/**
 * Return Blood Bowl Match analysis
 * @param {string} file - the path to the replay file
 * @return {requestCallback} next
 */
var getBB2replay = function (file) {
  var validArgument = true,
      error;
  try {
    if (arguments.length !== 1) {
      throw new Error('function is waiting one argument');
    } else {
      if (typeof arguments[0] !== 'string')
      throw new Error('argument should be a path to the BB2 replay file');
    }
  }
  catch (err) {
    error = err;
    validArgument = false;
  }

  return new Promise(function (resolve, reject) {
    if (!validArgument) 
      reject(error);
    async.series([
      function (cb) {
        check.fileExist(file, function (err) {
          if (err)
            return cb(err);
          cb(null);
        });
      },
      function (cb) {
        bb2Helpers(file, function (err, replay) {
          if (err)
            return cb(err);
          cb(null, replay);
        });
      }
    ], function (err, res) {
      if (err)
        reject(err);
      resolve(res[1]);
    });
  });
};

module.exports = {
  getBB2replay: getBB2replay
};