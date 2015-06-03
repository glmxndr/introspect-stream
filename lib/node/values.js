"use strict";
var $__utils__;
'use strict';
var $__0 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    uuid = $__0.uuid,
    repr = $__0.repr;
var Values = function() {
  for (var args = [],
      $__1 = 0; $__1 < arguments.length; $__1++)
    args[$__1] = arguments[$__1];
  this.id = uuid('Values');
  this.args = args;
};
Values.prototype = {
  toString: repr('args'),
  applyTo: function(fn, ctx) {
    fn.apply(ctx, this.args);
  }
};
var values = (function() {
  for (var args = [],
      $__2 = 0; $__2 < arguments.length; $__2++)
    args[$__2] = arguments[$__2];
  return args[0] instanceof Values ? args[0] : new (Function.prototype.bind.apply(Values, $traceurRuntime.spread([null], args)))();
});
Values.apply = function(fn, ctx, v) {
  return values(v).applyTo(fn, ctx);
};
Object.defineProperties(module.exports, {
  Values: {get: function() {
      return Values;
    }},
  values: {get: function() {
      return values;
    }},
  __esModule: {value: true}
});
