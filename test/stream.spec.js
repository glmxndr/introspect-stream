/*global describe, it*/
'use strict';

var _ = require('lodash');
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;

var lib = require('../lib/node/stream');
var stream = lib.stream;
var Observable = lib.Observable;

var expectAsync = function (test) {
  return function (done, time) {
    time = time || 15;
    setTimeout(function () {
      try { test(); done(); }
      catch(e) { done(e); }
    }, time);
  };
};

describe('Observale', function () {
  describe('.map', function () {
    it ('provides a new stream with mapped values', function (done) {
      var sink = [];
      stream([1,2,3])//.logAs('init')
        .map(function (x) { return x + 1; })//.logAs('mapped')
        .onNext(function(x) { sink.push(x); })
        .onEnd(function () {
          expect(sink).to.deep.equal([2,3,4]);
          done();
        });
    });
  });

  describe('.filter', function () {
    it ('provides a new stream with filtered values', function (done) {
      var sink = [];
      stream([1,2,3,4,5,6,7])//.logAs('init')
        .filter(function (x) { return x % 2 === 0; })//.logAs('evens')
        .onNext(function(x) { sink.push(x); })
        .onEnd(function () {
          expect(sink).to.deep.equal([2,4,6]);
          done();
        });
    });
  });

  describe('.scan', function () {
    it ('provides a new stream with scanned values', function (done) {
      var sink = [];
      stream([1,2,3,4])//.logAs('init')
        .scan(function (acc, x) { return acc + x; }, 0)//.logAs('sum')
        .onNext(function(x) { sink.push(x); })
        .onEnd(function () {
          expect(sink).to.deep.equal([1,3,6,10]);
          done();
        });
    });
  });

  describe('.merge', function () {
    it ('provides a new stream with merged values', function (done) {
      var sink = [];
      var bools = stream();
      var nums = stream([1,2,3]).onEnd(function() { bools.next(true); bools.end(); });
      var chars = stream(['a', 'b']).onEnd(function() { bools.next(false); });

      var merged = nums.merge(chars, bools);
      merged
        .onNext(function(x) { sink.push(x); })
        .onEnd(function () {
          expect(sink).to.deep.equal([1,'a',2,'b',3,false,true]);
          done();
        });
    });
  });

  describe('.zip', function () {
    it ('provides a new stream with zipped values', function (done) {
      var sink = [];
      var bools = stream([false, true]);
      var nums = stream([1,2,3,4,5]);
      var chars = stream(['a', 'b', 'c', 'd']);
      var zipped = nums.zip(chars, bools);
      zipped
        .onNext(function(n,c,b) { sink.push([n,c,b]); })
        .onEnd(function () {
          expect(sink).to.deep.equal([[1,'a',false], [2,'b',true]]);
          done();
        });
    });
  });

  describe('.buffer', function () {
    it ('provides a new stream with buffered values', function (done) {
      var sink = [];
      stream([1,2,3,4,5,6,7,8,9,10,11])//.logAs('nums')
        .buffer(3)//.logAs('buffered')
        .onNext(function(x) { sink.push(x); })
        .onEnd(function () {
          expect(sink).to.deep.equal([[1,2,3], [4,5,6], [7,8,9], [10,11]]);
          done();
        });
    });
  });

});
