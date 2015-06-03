"use strict";
var $__utils__;
'use strict';
var $__0 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    later = $__0.later,
    safe = $__0.safe;
var Priority = function(parent) {
  this.parent = parent;
  this.rank = parent ? (parent.rank + 1) : 0;
  this.queue = [];
  this._next = null;
};
Priority.prototype = {
  hasNext: function() {
    return !!this._next;
  },
  next: function() {
    if (this._next) {
      return this._next;
    }
    this._next = new Priority(this);
    return this._next;
  },
  push: function(fn) {
    this.queue.push(fn);
    later(Priority.nextTick);
    return this;
  },
  loop: function(fn) {
    var $__1 = this;
    var rec = (function() {
      return fn() && $__1.push(rec);
    });
    this.push(rec);
  },
  toString: function() {
    return ("" + this.queue.length + (this._next ? (',' + this._next.toString()) : ''));
  }
};
Priority.root = new Priority();
Priority.nextTick = function() {
  var last = Priority.root;
  while (last.hasNext()) {
    last = last.next();
  }
  while (last.parent && last.queue.length === 0) {
    last = last.parent;
  }
  if (last.queue.length > 0) {
    var fn = last.queue.shift();
    safe(fn)();
    later(Priority.nextTick);
  }
};
Object.defineProperties(module.exports, {
  Priority: {get: function() {
      return Priority;
    }},
  __esModule: {value: true}
});
