'use strict';
import { uuid, repr } from './utils';

export var Values = function (args) {
  if (!(this instanceof Values)) { return new Values(args); }
  this.id = uuid('Values');
  this.args = args ? [].slice.call(args) : [];
  
  // Remove the additional Values pointer appended
  // to the list of params when calling applyTo
  if (this.args[this.args.length - 1] === Values) { this.args.pop(); }
};

Values.prototype = {
  toString: repr('args'),
  applyTo: function (fn, ctx) {
    return fn.apply(ctx, this.args.concat([Values]));
  },
  push: function (x) { this.args.push(x); return this; }
};

Values.flatten = function (...args) {
  if (args.length === 1 && args[0] instanceof Values) { return args[0]; }
  var result = [];
  args.forEach(a => {
    if (a instanceof Values) { result = result.concat(a.args); }
    else { result.push(a); }
  });
  return new Values(result);
};

Values.from = Values.flatten;

Values.apply = function (fn, ctx, ...v) {
  return Values.flatten(...v).applyTo(fn, ctx);
};
