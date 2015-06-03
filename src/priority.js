'use strict';

import {later, safe} from './utils';

export var Priority = function (parent) {
  this.parent = parent;
  this.rank = parent ? (parent.rank + 1) : 0;
  this.queue = [];
  this._next = null;
};

Priority.prototype = {
  hasNext: function () { return !!this._next; },
  next: function () {
    if (this._next) { return this._next; }
    this._next = new Priority(this);
    return this._next;
  },
  push: function (fn) {
    this.queue.push(fn);
    later(Priority.nextTick);
    return this;
  },
  loop: function (fn) {
    var rec = () => fn() && this.push(rec);
    this.push(rec);
  },
  toString: function () {
    return `${this.queue.length}${this._next ? (',' + this._next.toString()) : ''}`;
  }
};

Priority.root = new Priority();

Priority.nextTick = function () {
  var last = Priority.root;
  while (last.hasNext()) { last = last.next(); }
  while (last.parent && last.queue.length === 0) {
    last = last.parent;
  }
  if (last.queue.length > 0 ) {
    var fn = last.queue.shift();
    safe(fn)();
    later(Priority.nextTick);
  }
};
