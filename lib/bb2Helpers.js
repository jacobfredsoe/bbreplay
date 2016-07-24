/* global module */

'use strict';

// include npm packages
var xml2js = require('xml2js'),
    StreamZip = require('node-stream-zip'),
    Promise = require('promise');

/**
 * Convert replay xml data to json
 * @param {string} text - the xml replay file structure
 * @param {requestCallback} next - callback function
 * @return {requestCallack} next
 */
function textToJson(text, next) {
  xml2js.parseString(text,
      {
        normalizeTags: true,
        explicitArray: false,
        trim: true,
        valueProcessors: [xml2js.processors.parseNumbers]},
  function (err, result) {
    if (err)
      next(err);
    next(null, result);
  });
}
;

/**
 * read zip file
 * @param {string} file - the path to the file to be read
 */
function readZipXml(file) {
  var zip,
      newError = new Error();

  return new Promise(function (resolve, reject) {
    zip = new StreamZip({
      file: file,
      storeEntries: true
    });

    zip.on('error', function (err) {
      reject(err);
    });

    zip.on('ready', function () {
      if (zip.entriesCount !== 1) {
        newError = {
          name: 'FileIncorrect',
          message: 'The provided zipe file isn\'t a valid BBII file replay \n\
- The zip file doesn\'t less or more than 1 file.'
        };
        reject(newError);
      }

      var data = zip.entryDataSync(Object.keys(zip.entries())[0]);

      textToJson(data, function (err, result) {
        if (err) {
          newError = {
            name: 'replayFileIncorrect',
            message: 'The provided zipe file isn\'t a valid BBII file replay \n\
- Can\'t convert replay xml file to json'
          };
        }
        resolve(result);
      });
    });
  });
}

/**
 * Read BB2 replay file
 * @param {string} file - the path to the file to be read
 * @param {requestCallback} next - callback function
 * @return {requestCallback} next
 */
var readReplay = function (file, next) {
  readZipXml(file)
      .then(function (data) {
        var result = data.replay.replaystep[data.replay.replaystep.length - 1].
            ruleseventgamefinished.matchresult;
        return next(null, result);
      })
      .catch(function (err) {
        return next(err);
      }); 
};

module.exports = {
  readReplay: readReplay
};