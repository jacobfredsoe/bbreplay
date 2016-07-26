'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var bbreplay = require('../main');

describe('test bbreplay getBB2replay function', function () {

  it('should return error if sent argument is not a string',
      function () {
        var file = {};
        return bbreplay.getBB2replay(file)
            .catch(function (err) {
              assert.notEqual(err, null);
            });
      });


  it('should return an error if sent argument is not an existing file',
      function () {
        var file = 'xxxx';
        return bbreplay.getBB2replay(file)
            .catch(function (err) {
              assert.notEqual(err, null);
            });
      });

  it('should return an error if sent argument is not a valid replay file',
      function () {
        var file = './test/replay.md';
        return bbreplay.getBB2replay(file)
            .catch(function (err) {
              assert.notEqual(err, null);
            });
      });

  it('should return object with data if sent file is a correct BB2 replay file',
      function () {
        var file = './test/1545597_Coach-81993-95c8420d237834b32549aca42dfe965c_2016-03-01_13_19_40.bbrz';
        this.timeout(20000);
        return bbreplay.getBB2replay(file)
            .then(function (res) {
              expect(res).to.be.an('object');
            });
      });
});
