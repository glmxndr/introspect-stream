"use strict";
var $__lodash__,
    $__chalk__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var chalk = ($__chalk__ = require("chalk"), $__chalk__ && $__chalk__.__esModule && $__chalk__ || {default: $__chalk__}).default;
var extend = (function(constr) {
  var $__6;
  for (var objs = [],
      $__3 = 1; $__3 < arguments.length; $__3++)
    objs[$__3 - 1] = arguments[$__3];
  return ($__6 = _).assign.apply($__6, $traceurRuntime.spread([{}, constr.prototype], objs));
});
var mixin = (function() {
  for (var constrs = [],
      $__4 = 0; $__4 < arguments.length; $__4++)
    constrs[$__4] = arguments[$__4];
  return (function() {
    var $__6;
    for (var objs = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      objs[$__5] = arguments[$__5];
    var proto = {};
    constrs.forEach((function(c) {
      return _.assign(proto, c.prototype);
    }));
    return ($__6 = _).extend.apply($__6, $traceurRuntime.spread([{}, proto], objs));
  });
});
var later = (function(fn) {
  return setImmediate(fn);
});
var safe = function(fn, ctx) {
  return function() {
    for (var args = [],
        $__5 = 0; $__5 < arguments.length; $__5++)
      args[$__5] = arguments[$__5];
    try {
      fn.apply(ctx, args);
    } catch (e) {
      console.error(chalk.red(("ERROR '" + e + "' in \n" + fn)));
      console.trace();
    }
  };
};
var pad = function(o) {
  var num = arguments[1] !== (void 0) ? arguments[1] : 15;
  var str = o.toString();
  if (str.length >= num) {
    return str;
  }
  return pad(str + ' ', num);
};
var uuid = ((function() {
  var x = 0;
  return (function(prefix) {
    return ((prefix || '') + "#" + x++);
  });
}))();
var repr = function() {
  for (var props = [],
      $__5 = 0; $__5 < arguments.length; $__5++)
    props[$__5] = arguments[$__5];
  return function() {
    var $__2 = this;
    return [this.id, ' {', props.map((function(p) {
      return chalk.cyan(p) + ($__2[p] === undefined ? '' : ': ' + $__2[p]);
    })).join(', '), '}'].join('');
  };
};
var print = function(obj, msg) {
  var chalkid = chalk.yellow;
  var prefix = _.padRight(obj.toString(), 20, ' ');
  var out = (prefix + msg).replace(/([a-z]+)(#)([0-9]+)/gi, (function(m, t, h, n) {
    return chalk.magenta(t) + chalk.grey(h) + chalk.yellow(n);
  }));
  console.log(out);
};
Object.defineProperties(module.exports, {
  extend: {get: function() {
      return extend;
    }},
  mixin: {get: function() {
      return mixin;
    }},
  later: {get: function() {
      return later;
    }},
  safe: {get: function() {
      return safe;
    }},
  pad: {get: function() {
      return pad;
    }},
  uuid: {get: function() {
      return uuid;
    }},
  repr: {get: function() {
      return repr;
    }},
  print: {get: function() {
      return print;
    }},
  __esModule: {value: true}
});
