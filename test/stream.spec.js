/*global describe, it*/
'use strict';

var _ = require('lodash');
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;

var stream = require('../').stream;

var expectAsync = function (test) {
  return function (done, time) {
    time = time || 15;
    setTimeout(function () {
      try { test(); done(); }
      catch(e) { done(e); }
    }, time);
  };
};

//*/
describe('stream', function () {
  it ('must work!', function (done) {
    setTimeout(function () { done(); }, 20);
  });

});
//*/
