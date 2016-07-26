/* global module */

'use strict';

// include npm packages
var async = require('async');

// include modules libraries
var check = require('./lib/check'),
    bb2Helpers = require('./lib/bb2Helpers');

/**
 * Return Blood Bowl Match analysis
 * @param {object} params - the parameters of the function
 * @param {requestCallback} next - callback function
 * @return {requestCallback} next
 */
var getMatchData = function (params, next) {
  try {
    if (arguments.length !== 2) {
      throw new Error('function is waiting two arguments');
    } else {
      if (typeof arguments[0] !== 'object')
        throw new Error('first argument should be an object');
      if (typeof arguments[1] !== 'function')
        throw new Error('second argument should be a callback function');
    }
  }
  catch (err) {
    return err;
  }
  async.series([
    function (cb) {
      check.param(params, function (err) {
        if (err)
          return cb(err);
        cb(null);
      });
    },
    function (cb) {
      check.fileExist(params.replay, function (err) {
        if (err)
          return cb(err);
        cb(null);
      });
    },
    function (cb) {
      bb2Helpers(params.replay, function (err, replay) {
        if (err)
          return cb(err);
        cb(null, replay);
      });
    }
  ], function (err, res) {
    if (err)
      return next(err);
    return next(null, res[2]);
  });
};


module.exports = getMatchData;