'use strict';

import Values from './values';

export var Emitter = function () {
  this._events = {};
};

Emitter.prototype = {
  on: function (type, fn) {
    if (!this._events[type]) { this._events[type] = new Set(); }
    this._events[type].add(fn);
  },

  off: function (type, fn) {
    if (arguments.length === 0) { this._events = {}; }
    if (!this._events[type]) { return; }
    if (fn) { this._events[type].delete(fn); }
    else { this._events[type].clear(); }
  },

  emit: function (type, values) {
    if (!this._events[type]) { return; }
    for (let fn of this._events[type].values()) {
      fn.call(this, values);
      //Values.apply(fn, this, values);
    }
  }
};
