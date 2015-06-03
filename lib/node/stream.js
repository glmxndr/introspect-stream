"use strict";
var $__lodash__,
    $__introspect_45_typed__,
    $__events__,
    $__priority__,
    $__utils__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var overload = ($__introspect_45_typed__ = require("introspect-typed"), $__introspect_45_typed__ && $__introspect_45_typed__.__esModule && $__introspect_45_typed__ || {default: $__introspect_45_typed__}).overload;
var Emitter = ($__events__ = require("./events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).Emitter;
var Priority = ($__priority__ = require("./priority"), $__priority__ && $__priority__.__esModule && $__priority__ || {default: $__priority__}).Priority;
var $__4 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    uuid = $__4.uuid,
    safe = $__4.safe,
    extend = $__4.extend,
    print = $__4.print,
    repr = $__4.repr;
var NEXT = {
  NEXT: true,
  toString: (function() {
    return 'NXT';
  })
};
var END = {
  END: true,
  toString: (function() {
    return 'END';
  })
};
var LAST_ENDED = function() {
  if (this._sources.length === 0) {
    this.end();
  }
};
var ANY_ENDED = function() {
  this.end();
};
var OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract'];
var Observable = function() {
  var $__12;
  var opts = arguments[0] !== (void 0) ? arguments[0] : {};
  var $__5 = this;
  Emitter.call(this);
  this.id = uuid('Obs');
  OVERRIDABLE.forEach((function(p) {
    if (opts[p]) {
      $__5['_' + p] = opts[p];
    }
  }));
  if (opts.parent) {
    this._priority = opts.parent._priority.next();
  } else {
    this._priority = Priority.root;
  }
  this._state = opts.init || null;
  if (opts.sources) {
    this._endingStrategy = (opts.endWhen === 'all') ? LAST_ENDED : ANY_ENDED;
    this._sources = opts.sources;
    ($__12 = this).plugTo.apply($__12, $traceurRuntime.spread(this._sources));
  }
};
Observable.prototype = _.extend(Emitter.prototype, {
  _accept: (function() {
    return true;
  }),
  _reduce: (function(current, x) {
    return x;
  }),
  _extract: (function(x) {
    return x;
  }),
  _ready: (function() {
    return true;
  }),
  _later: function(fn) {
    this._priority.push(fn);
  },
  _unplug: function(pub) {
    this._sources = _(this._sources).without(pub).value();
    this._endingStrategy();
  },
  name: function(n) {
    return n ? (this._name = n, this) : this._name;
  },
  toString: function() {
    return (this.id + " " + (this._name || 'anon'));
  },
  plugTo: function() {
    for (var pubs = [],
        $__6 = 0; $__6 < arguments.length; $__6++)
      pubs[$__6] = arguments[$__6];
    var $__5 = this;
    pubs.forEach((function(pub) {
      return pub.plug($__5);
    }));
    return this;
  },
  plug: function() {
    for (var subs = [],
        $__7 = 0; $__7 < arguments.length; $__7++)
      subs[$__7] = arguments[$__7];
    var $__5 = this;
    if (this.ended()) {
      return this;
    }
    subs.forEach((function(sub) {
      var onNext = (function(v) {
        return sub.next(v);
      });
      var onEnd = (function() {
        return sub._unplug($__5);
      });
      $__5.on(NEXT, onNext);
      $__5.on(END, onEnd);
      sub.on(END, (function() {
        $__5.off(NEXT, onNext);
        $__5.off(END, onEnd);
      }));
    }));
    return this;
  },
  consume: function() {
    for (var fns = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      fns[$__8] = arguments[$__8];
    var $__5 = this;
    if (this.ended()) {
      return this;
    }
    fns.forEach((function(fn) {
      return $__5.on(NEXT, safe(fn));
    }));
    return this;
  },
  state: function() {
    return this._state;
  },
  ended: function() {
    return this._state === END;
  },
  next: function(x) {
    var $__5 = this;
    if (this.ended()) {
      return ;
    }
    if (arguments.length === 0) {
      return this._state;
    }
    this._later((function() {
      if (!$__5._accept(x)) {
        return $__5;
      }
      $__5._state = $__5._reduce($__5._state, x);
      if ($__5._ready()) {
        $__5.emit(NEXT, $__5._extract($__5._state));
      }
    }));
    return this;
  },
  end: function() {
    var $__5 = this;
    if (this.ended()) {
      return ;
    }
    this._later((function() {
      return $__5._state = END;
    }), this.emit(END));
    return this;
  },
  log: function() {
    var $__5 = this;
    this.on(NEXT, (function(x) {
      return print($__5, ("~( " + x));
    }));
    this.on(END, (function() {
      return print($__5, "~# END");
    }));
    return this;
  },
  logAs: function(n) {
    return this.name(n).log();
  },
  combine: function(opts) {
    for (var others = [],
        $__9 = 1; $__9 < arguments.length; $__9++)
      others[$__9 - 1] = arguments[$__9];
    opts.parent = opts.parent || this;
    opts.sources = opts.sources || [this].concat(others);
    return new Observable(opts);
  },
  map: function(fn) {
    return this.combine({reduce: (function(c, x) {
        return fn(x);
      })});
  },
  reduce: function(fn, init) {
    return this.combine({
      reduce: fn,
      init: init
    });
  },
  filter: function(pred) {
    return this.combine({accept: pred});
  },
  merge: function() {
    var $__12;
    for (var os = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      os[$__10] = arguments[$__10];
    return ($__12 = this).combine.apply($__12, $traceurRuntime.spread([{endWhen: 'all'}], os));
  },
  zip: function() {
    for (var os = [],
        $__11 = 0; $__11 < arguments.length; $__11++)
      os[$__11] = arguments[$__11];
    os.unshift(this);
    var srcs = os.map((function(o) {
      return o.map((function(x) {
        return ({
          id: o.id,
          value: x
        });
      }));
    }));
    var ids = _.pluck(os, 'id');
    var qs = {};
    os.forEach((function(s) {
      qs[s.id] = [];
    }));
    var ready = (function() {
      return (ids.every((function(id) {
        return qs[id].length > 0;
      })));
    });
    var reduce = (function(_, msg) {
      return (qs[msg.id].push(msg.value), qs);
    });
    var extract = (function() {
      return ids.reduce((function(r, id) {
        return (r.push(qs[id].shift()), r);
      }), []);
    });
    var opts = {
      ready: ready,
      reduce: reduce,
      extract: extract,
      init: qs,
      sources: srcs,
      parent: this
    };
    return this.combine(opts);
  }
});
var stream = overload((function(opts) {
  return new Observable(opts);
})).when('named', [String], (function(name, o) {
  return o.default({name: name});
})).when('values', [Array], (function(values, o) {
  return o.namedValues('anon', values);
})).when('namedValues', [String, Array], (function(name, values, o) {
  var t = o.default({name: name});
  var nextVal = (function() {
    return (values.length ? (t.next(values.shift()), true) : (t.end(), false));
  });
  t._priority.loop(nextVal);
  return t;
}));
var nums = stream([1, 2, 3, 4, 5, 6]).logAs('nums');
var simple100 = nums.map((function(x) {
  return x + 100;
}));
var chars = stream(['a', 'b', 'c', 'd', 'e']).logAs('chars');
var charnum = chars.zip(nums).logAs('charnum');
charnum.map((function(x) {
  return x[0] + x[1];
})).logAs('concat');
nums.merge(simple100, chars).map((function(x) {
  return x + x;
}));
;
Object.defineProperties(module.exports, {
  stream: {get: function() {
      return stream;
    }},
  __esModule: {value: true}
});
