'use strict';

var chai = require('chai'),
    expect = chai.expect,
    assert = chai.assert,
    should = chai.should();

var bbreplay = require('../main');

describe('test bbreplay.matchResults', function () {

  it('should return error if params is an empty object',
      function (done) {
        bbreplay.getMatchResults({}, function (err, res) {
          expect(err).to.be.an('object');
          done();
        });
      });

  it('should return an error if param.replay is not an existing file',
      function (done) {
        var data = {
          replay: 'xxxxx'
        };
        bbreplay.getMatchResults(data, function (err, res) {
          assert.notEqual(err, null);
          done();
        });
      });

  it('should return an error if param.replay is not a valid replay file',
      function (done) {
        var data = {
          replay: './test/replay.md'
        };
        bbreplay.getMatchResults(data, function (err, res) {
          assert.notEqual(err, null);
          done();
        });
      });
      
  it('should return no error and matchresult object if param is an object with valid replay file',
      function (done) {
        var data = {
          replay: './test/1545597_Coach-81993-95c8420d237834b32549aca42dfe965c_2016-03-01_13_19_40.bbrz'
        };
        this.timeout(20000);
        bbreplay.getMatchResults(data, function (err, res) {
          assert.equal(err, null);
          expect(res).to.be.an('object');
          done();
        });
      });
      
});