"use strict";
var $__values__;
'use strict';
var Values = ($__values__ = require("./values"), $__values__ && $__values__.__esModule && $__values__ || {default: $__values__}).Values;
var Emitter = function() {
  this._events = {};
};
Emitter.prototype = {
  on: function(type, fn) {
    if (!this._events[type]) {
      this._events[type] = new Set();
    }
    this._events[type].add(fn);
  },
  off: function(type, fn) {
    if (arguments.length === 0) {
      this._events = {};
    }
    if (!this._events[type]) {
      return ;
    }
    if (fn) {
      this._events[type].delete(fn);
    } else {
      this._events[type].clear();
    }
  },
  emit: function(type) {
    var $__9;
    for (var args = [],
        $__8 = 1; $__8 < arguments.length; $__8++)
      args[$__8 - 1] = arguments[$__8];
    if (!this._events[type]) {
      return ;
    }
    var $__4 = true;
    var $__5 = false;
    var $__6 = undefined;
    try {
      for (var $__2 = void 0,
          $__1 = (this._events[type].values())[$traceurRuntime.toProperty(Symbol.iterator)](); !($__4 = ($__2 = $__1.next()).done); $__4 = true) {
        var fn = $__2.value;
        {
          ($__9 = Values).apply.apply($__9, $traceurRuntime.spread([fn, this], args));
        }
      }
    } catch ($__7) {
      $__5 = true;
      $__6 = $__7;
    } finally {
      try {
        if (!$__4 && $__1.return != null) {
          $__1.return();
        }
      } finally {
        if ($__5) {
          throw $__6;
        }
      }
    }
  }
};
Object.defineProperties(module.exports, {
  Emitter: {get: function() {
      return Emitter;
    }},
  __esModule: {value: true}
});
