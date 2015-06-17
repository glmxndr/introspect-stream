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
  this.args = args ? [].slice.call(args) : [];
  if (this.args[this.args.length - 1] === Values) {
    this.args.pop();
  }
};
Values.prototype = {
  toString: repr('args'),
  applyTo: function(fn, ctx) {
    return fn.apply(ctx, this.args.concat([Values]));
  },
  push: function() {
    for (var xs = [],
        $__2 = 0; $__2 < arguments.length; $__2++)
      xs[$__2] = arguments[$__2];
    var $__1 = this;
    xs.forEach(function(x) {
      if (x instanceof Values) {
        $__1.args = $__1.args.concat(x.args);
      } else {
        $__1.args.push(x);
      }
    });
    return this;
  }
};
Values.flatten = function() {
  for (var args = [],
      $__3 = 0; $__3 < arguments.length; $__3++)
    args[$__3] = arguments[$__3];
  if (args.length === 1 && args[0] instanceof Values) {
    return args[0];
  }
  var result = [];
  args.forEach(function(a) {
    if (a instanceof Values) {
      result = result.concat(a.args);
    } else {
      result.push(a);
    }
  });
  return new Values(result);
};
Values.from = Values.flatten;
Values.apply = function(fn, ctx) {
  var $__5;
  for (var v = [],
      $__4 = 2; $__4 < arguments.length; $__4++)
    v[$__4 - 2] = arguments[$__4];
  return ($__5 = Values).flatten.apply($__5, $traceurRuntime.spread(v)).applyTo(fn, ctx);
};
Object.defineProperties(module.exports, {
  Values: {get: function() {
      return Values;
    }},
  __esModule: {value: true}
});
