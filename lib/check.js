/* global module */

'use strict';

// include npm packages
var fs = require('fs');


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
  fileExist: fileExist
};