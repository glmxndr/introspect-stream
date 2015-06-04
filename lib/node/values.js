"use strict";
var $__utils__;
'use strict';
var $__0 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    uuid = $__0.uuid,
    repr = $__0.repr;
var Values = function(args) {
  if (!(this instanceof Values)) {
    return new Values(args);
  }
  this.id = uuid('Values');
  this.args = args || [];
};
Values.prototype = {
  toString: repr('args'),
  applyTo: function(fn, ctx) {
    fn.apply(ctx, this.args.concat([Values]));
  },
  push: function(x) {
    this.args.push(x);
    return this;
  }
};
Values.flatten = function() {
  for (var args = [],
      $__1 = 0; $__1 < arguments.length; $__1++)
    args[$__1] = arguments[$__1];
  if (args.length === 1 && args[0] instanceof Values) {
    return args[0];
  }
  var result = [];
  args.forEach((function(a) {
    return a instanceof Values ? result.concat(a.args) : result.push(a);
  }));
  return new Values(result);
};
Values.apply = function(fn, ctx) {
  var $__3;
  for (var v = [],
      $__2 = 2; $__2 < arguments.length; $__2++)
    v[$__2 - 2] = arguments[$__2];
  return ($__3 = Values).flatten.apply($__3, $traceurRuntime.spread(v)).applyTo(fn, ctx);
};
Object.defineProperties(module.exports, {
  Values: {get: function() {
      return Values;
    }},
  __esModule: {value: true}
});
