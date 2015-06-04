/*global describe, it*/
'use strict';

var _ = require('lodash');
var chai = require('chai');
chai.use(require('chai-string'));
var expectAsync = require('./utils').expectAsync;
var expect = chai.expect;

var Emitter = require('../lib/node/events').Emitter;
var Values = require('../lib/node/values').Values;

describe('Emitter', function () {
  var k1 = 'event-key1';
  var proofs;
  var clear = function () { proofs = [0, 0, 0]; };
  var incr0 = function (x) { proofs[0] += x; };
  var incr1 = function (x) { proofs[1] += x; };
  var incr01 = function (x, y, vals) {
    proofs[0] += x;
    proofs[1] += y;
    proofs[2] = vals;
  };

  describe('.on', function () {
    it ('attaches events', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr0);
      e.on(k1, incr1);
      e.emit(k1, 1);
      expect(proofs[0]).to.equal(1);
      expect(proofs[1]).to.equal(1);
    });
  });

  describe('.off', function () {
    it ('removes a single event with the second argument', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr0);
      e.on(k1, incr1);
      e.off(k1, incr0);
      e.emit(k1, 1);
      expect(proofs[0]).to.equal(0);
      expect(proofs[1]).to.equal(1);
    });
    it ('removes all events without the second argument', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr0);
      e.on(k1, incr1);
      e.off(k1);
      e.emit(k1, 1);
      expect(proofs[0]).to.equal(0);
      expect(proofs[1]).to.equal(0);
    });
  });

  describe('.emit', function () {
    it ('triggers the event listeners for the key', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr0);
      e.on(k1, incr1);
      e.emit(k1, 1);
      expect(proofs[0]).to.equal(1);
      expect(proofs[1]).to.equal(1);
    });
    it ('provides the several args to the listener', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr01);
      e.emit(k1, 1, 2);
      expect(proofs[0]).to.equal(1);
      expect(proofs[1]).to.equal(2);
    });
    it('provides the Values object/function at the end of the listener args', function () {
      clear();
      var e = new Emitter();
      e.on(k1, incr01);
      e.emit(k1, 1, 2);
      expect(proofs[2]).to.equal(Values);
    });
  });

});
