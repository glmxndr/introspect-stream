'use strict';

import {later, safe} from './utils';

export var Priority = function (parent) {
  this.parent = parent;
  this.rank = parent ? (parent.rank + 1) : 0;
  this.queue = [];
  this._child = null;
};

Priority.prototype = {
  hasChild: function () { return !!this._child; },
  child: function () {
    if (this._child) { return this._child; }
    this._child = new Priority(this);
    return this._child;
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
    return `${this.queue.length}${this._child ? (',' + this._child.toString()) : ''}`;
  }
};

Priority.root = new Priority();

Priority.nextTick = function () {
  var last = Priority.root;
  while (last.hasChild()) { last = last.child(); }
  while (last.parent && last.queue.length === 0) {
    last = last.parent;
  }
  if (last.queue.length > 0 ) {
    var fn = last.queue.shift();
    safe(fn)();
    later(Priority.nextTick);
  }
};
