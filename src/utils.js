'use strict';

import _ from 'lodash';
import chalk from 'chalk';

export var extend = (constr, ...objs) => _.assign({}, constr.prototype, ...objs);

export var mixin = (...constrs) => (...objs) => {
  var proto = {}; constrs.forEach(c => _.assign(proto, c.prototype));
  return _.extend({}, proto, ...objs);
};

export var later = (process && process.nextTick) || setImmediate || setTimeout;

export var safe = function (fn, ctx) {
  return function (...args) {
    try { fn.apply(ctx, args); }
    catch(e) {
      console.error(chalk.red(`ERROR '${e}' in \n${fn}`));
      console.trace();
    }
  };
};

export var pad = function (o, num = 15) {
  var str = o.toString();
  if (str.length >= num) { return str; }
  return pad(str + ' ', num);
};

export var uuid = (() => { var x = 0; return (prefix) => `${prefix || ''}#${x++}`; })();

export var repr = function (...props) {
  return function () {
    return [
      this.id,
      ' {',
      props.map(p => chalk.cyan(p) +
        (this[p] === undefined ? '' : ': ' + this[p])
      ).join(', '),
      '}'
    ].join('');
  };
};

export var print = function (obj, msg) {
  var chalkid = chalk.yellow;
  var prefix = _.padRight(obj.toString(), 20, ' ');
  var out = (prefix + msg).replace(/([a-z]+)(#)([0-9]+)/gi, (m, t, h, n) =>
    chalk.magenta(t) + chalk.grey(h) + chalk.yellow(n)
  );
  console.log(out);
};
