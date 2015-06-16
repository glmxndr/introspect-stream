/*global describe, it*/
'use strict';

var _ = require('lodash');
var chai = require('chai');
chai.use(require('chai-string'));
var expect = chai.expect;

var Values = require('../lib/node/values').Values;

describe('Values', function () {

  describe('.push', function () {
    it('pushes an argument in the current instance args', function () {
      var v1 = new Values(['420', true]);
      expect(v1.args.length).to.be.equal(2);
      v1.push(15);
      expect(v1.args.length).to.be.equal(3);
      expect(v1.args).to.deep.equal(['420', true, 15]);
    });
  });

  describe('.flatten', function () {
    it ('returns the first arg if it is a Values obj', function () {
      var v0 = new Values(['420', true]);
      var v1 = Values.flatten(v0);
      expect(v1).to.be.equal(v0);
    });
    it ('returns a Values object combining the arguments', function () {
      var v1 = Values.flatten(42, '420');
      expect(v1).to.be.instanceof(Values);
      expect(v1.args.length).to.be.equal(2);
      expect(v1.args[0]).to.be.equal(42);
      expect(v1.args[1]).to.be.equal('420');
    });
    it ('unfolds the Values args', function () {
      var v0 = Values.from('420', true);
      var v1 = Values.flatten(42, v0, v0);
      expect(v1).to.be.instanceof(Values);
      expect(v1.args.length).to.be.equal(5);
      expect(v1.args).to.deep.equal([42, '420', true, '420', true]);
    });
  });

  describe('.from', function () {
    it ('is an alias for flatten', function () {
      expect(Values.from).to.be.equal(Values.flatten);
    });
  });

  describe('.applyTo', function () {
    it ('execs the given function with its args + Values appended', function () {
      var v = new Values(['str', 123]);
      var fn = function (s, n, v) { this.v = v; this.sn = s + n; return 'ok'; };
      var ctx = {};
      var result = v.applyTo(fn, ctx);
      expect(result).to.equal('ok');
      expect(ctx.sn).to.equal('str123');
      expect(ctx.v).to.equal(Values);
    });
  });

  describe('.apply', function () {
    it ('execs the given function with the given flattened args', function () {
      var v = new Values(['str', 123]);
      var fn = function (x, s, n, v) {
        this.x = x;
        this.v = v;
        this.sn = s + n;
        return 'ok';
      };
      var ctx = {};
      var result = Values.apply(fn, ctx, 42, v);
      expect(result).to.equal('ok');
      expect(ctx.x).to.equal(42);
      expect(ctx.sn).to.equal('str123');
      expect(ctx.v).to.equal(Values);
    });
  });

});
