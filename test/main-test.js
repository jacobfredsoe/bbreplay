var chai = require('chai');
var expect = chai.expect;
var bbreplay = require('../main');

describe('main', function () {
  it('bbreplay() should return null if no file are passed in', function () {
    var data = bbreplay();
    expect(data).to.equal(null);
  });
});