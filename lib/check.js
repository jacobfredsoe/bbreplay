/* global module */

'use strict';

// include npm packages
var tv4 = require('tv4'),
    fs = require('fs');

/**
 * Check if function parameter corresponds to expected one
 * @param {object} param
 * @param {requestCallback} next
 * @return {requestCallback} next
 */
var param = function (param, next) {
  var paramSchema = {
    "type": "object",
    "properties": {
      "replay": {
        "type": "string"
      }
    },
    "required": ["replay"]
  };
  var valid = tv4.validate(param, paramSchema);
  if (!valid)
    return next(tv4.error);
  return next(null);
};

/**
 * Check if a file exists
 * @param {string} file - the path to the file to be tested
 * @param {requestCallback} next - callback function
 * @return {requestCallback} next
 */
var fileExist = function (file, next) {
  fs.access(file, fs.R_OK, function (err) {
    if (err)
      return next(err);
    return next();
  });
};


module.exports = {
  param: param,
  fileExist: fileExist
};