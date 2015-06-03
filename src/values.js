'use strict';
import { uuid, repr } from './utils';

export var Values = function (...args) {
  this.id = uuid('Values');
  this.args = args;
};

Values.prototype = {
  toString: repr('args'),
  applyTo: function (fn, ctx) {
    fn.apply(ctx, this.args);
  }
};

export var values = (...args) => args[0] instanceof Values ? args[0] : new Values(...args);

Values.apply = function (fn, ctx, v) {
  return values(v).applyTo(fn, ctx);
};
