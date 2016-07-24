/* global module */

'use strict';

// include npm packages
var async = require('async');

// include modules libraries
var check = require('./lib/check'),
    bb2Helpers = require('./lib/bb2Helpers');

/**
 * Return Blood Bowl Match result
 * @param {object} param - the parameters of the function
 * @param {requestCallback} next - callback function
 * @return {requestCallback} next
 */
var getMatchResults = function (param, next) {
  async.series([
    function (cb) {
      check.param(param, function (err) {
        if (err)
          return cb(err);
        cb(null);
      });
    },
    function (cb) {
      check.fileExist(param.replay, function (err) {
        if (err)
          return cb(err);
        cb(null);
      });
    },
    function (cb) {
      bb2Helpers.readReplay(param.replay, function (err, replay) {
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

module.exports = {
  getMatchResults: getMatchResults
};
