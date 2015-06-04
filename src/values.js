'use strict';
import { uuid, repr } from './utils';

export var Values = function (args) {
  if (!(this instanceof Values)) { return new Values(args); }
  this.id = uuid('Values');
  this.args = args || [];
};

Values.prototype = {
  toString: repr('args'),
  applyTo: function (fn, ctx) { fn.apply(ctx, this.args.concat([Values])); },
  push: function (x) { this.args.push(x); return this; }
};

Values.flatten = function (...args) {
  if (args.length === 1 && args[0] instanceof Values) { return args[0]; }
  var result = [];
  args.forEach(a => a instanceof Values ? result.concat(a.args) : result.push(a));
  return new Values(result);
};

Values.apply = function (fn, ctx, ...v) {
  return Values.flatten(...v).applyTo(fn, ctx);
};
