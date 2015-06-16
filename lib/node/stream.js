"use strict";
var $__lodash__,
    $__introspect_45_typed__,
    $__events__,
    $__priority__,
    $__values__,
    $__utils__;
'use strict';
var _ = ($__lodash__ = require("lodash"), $__lodash__ && $__lodash__.__esModule && $__lodash__ || {default: $__lodash__}).default;
var $__1 = ($__introspect_45_typed__ = require("introspect-typed"), $__introspect_45_typed__ && $__introspect_45_typed__.__esModule && $__introspect_45_typed__ || {default: $__introspect_45_typed__}),
    Matcher = $__1.Matcher,
    overload = $__1.overload;
var Emitter = ($__events__ = require("./events"), $__events__ && $__events__.__esModule && $__events__ || {default: $__events__}).Emitter;
var Priority = ($__priority__ = require("./priority"), $__priority__ && $__priority__.__esModule && $__priority__ || {default: $__priority__}).Priority;
var vals = ($__values__ = require("./values"), $__values__ && $__values__.__esModule && $__values__ || {default: $__values__}).Values;
var $__5 = ($__utils__ = require("./utils"), $__utils__ && $__utils__.__esModule && $__utils__ || {default: $__utils__}),
    uuid = $__5.uuid,
    safe = $__5.safe,
    extend = $__5.extend,
    print = $__5.print,
    repr = $__5.repr;
var NEXT = {
  NEXT: true,
  toString: (function() {
    return 'NEXT';
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
var OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract', 'complete'];
var Observable = function() {
  var $__17;
  var opts = arguments[0] !== (void 0) ? arguments[0] : {};
  var $__6 = this;
  Emitter.call(this);
  this.id = uuid('Obs');
  OVERRIDABLE.forEach((function(p) {
    if (opts[p]) {
      $__6['_' + p] = opts[p];
    }
  }));
  if (opts.parent) {
    this._priority = opts.parent._priority.child();
  } else {
    this._priority = Priority.root;
  }
  this._state = opts.init || null;
  if (opts.sources) {
    this._endingStrategy = (opts.endWhen === 'all') ? LAST_ENDED : ANY_ENDED;
    this._sources = opts.sources;
    ($__17 = this)._plugTo.apply($__17, $traceurRuntime.spread(this._sources));
  }
};
Observable.prototype = _.extend(Emitter.prototype, {
  _accept: (function() {
    return true;
  }),
  _reduce: (function(current) {
    for (var x = [],
        $__7 = 1; $__7 < arguments.length; $__7++)
      x[$__7 - 1] = arguments[$__7];
    return vals(x);
  }),
  _extract: (function(x) {
    return x;
  }),
  _ready: (function() {
    return true;
  }),
  _complete: (function() {
    return false;
  }),
  _later: function(fn) {
    this._priority.push(fn);
  },
  _unplug: function(pub) {
    this._sources = _(this._sources).without(pub).value();
    this._endingStrategy();
  },
  _plugTo: function() {
    for (var pubs = [],
        $__8 = 0; $__8 < arguments.length; $__8++)
      pubs[$__8] = arguments[$__8];
    var $__6 = this;
    pubs.forEach((function(pub) {
      return pub._plug($__6);
    }));
    return this;
  },
  _plug: function() {
    for (var subs = [],
        $__9 = 0; $__9 < arguments.length; $__9++)
      subs[$__9] = arguments[$__9];
    var $__6 = this;
    if (this.ended()) {
      return this;
    }
    subs.forEach((function(sub) {
      var onNext = (function() {
        var $__17;
        for (var v = [],
            $__10 = 0; $__10 < arguments.length; $__10++)
          v[$__10] = arguments[$__10];
        return ($__17 = sub).next.apply($__17, $traceurRuntime.spread(v));
      });
      var onEnd = (function() {
        return sub._unplug($__6);
      });
      $__6.on(NEXT, onNext);
      $__6.on(END, onEnd);
      sub.on(END, (function() {
        $__6.off(NEXT, onNext);
        $__6.off(END, onEnd);
      }));
    }));
    return this;
  },
  name: function(n) {
    return n ? (this._name = n, this) : this._name;
  },
  state: function() {
    return this._state;
  },
  toString: function() {
    return (this.id + " " + (this._name || 'anon'));
  },
  broadcast: function() {
    this._last = this._extract(this._state);
    this.emit(NEXT, this._last);
  },
  next: function() {
    var $__17;
    for (var x = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      x[$__10] = arguments[$__10];
    var $__6 = this;
    var v = ($__17 = vals).flatten.apply($__17, $traceurRuntime.spread(x));
    if (this.ended()) {
      return ;
    }
    this._later((function() {
      var $__18,
          $__19;
      if (!($__18 = $__6)._accept.apply($__18, $traceurRuntime.spread(v.args))) {
        return $__6;
      }
      $__6._state = ($__19 = $__6)._reduce.apply($__19, $traceurRuntime.spread([$__6._state], v.args));
      if ($__6._ready()) {
        $__6.broadcast();
      }
      if ($__6._complete()) {
        $__6.end();
      }
    }));
    return this;
  },
  last: function() {
    return this._last;
  },
  end: function() {
    var $__6 = this;
    if (this.ended()) {
      return ;
    }
    this._state = END;
    this._later((function() {
      return $__6.emit(END);
    }));
    return this;
  },
  ended: function() {
    return this._state === END;
  },
  onNext: function() {
    for (var fns = [],
        $__11 = 0; $__11 < arguments.length; $__11++)
      fns[$__11] = arguments[$__11];
    var $__6 = this;
    if (this.ended()) {
      return this;
    }
    fns.forEach((function(fn) {
      return $__6.on(NEXT, safe(fn, $__6));
    }));
    return this;
  },
  onEnd: function() {
    for (var fns = [],
        $__12 = 0; $__12 < arguments.length; $__12++)
      fns[$__12] = arguments[$__12];
    var $__6 = this;
    if (this.ended()) {
      fns.forEach((function(fn) {
        return safe(fn, $__6)();
      }));
      return this;
    }
    fns.forEach((function(fn) {
      return $__6.on(END, safe(fn, $__6));
    }));
    return this;
  },
  log: function() {
    var $__6 = this;
    this.on(NEXT, (function() {
      for (var x = [],
          $__13 = 0; $__13 < arguments.length; $__13++)
        x[$__13] = arguments[$__13];
      x.pop();
      print($__6, ("~( " + x));
    }));
    this.on(END, (function() {
      return print($__6, "~# END");
    }));
    return this;
  },
  logAs: function(n) {
    return this.name(n).log();
  },
  scheduler: function(fn) {
    return this._priority;
  },
  run: function() {
    var $__6 = this;
    this._priority.loop((function() {
      return ($__6.next(), !$__6.ended());
    }));
  },
  branch: function(fn) {
    fn(this);
    return this;
  },
  combine: function(opts) {
    for (var others = [],
        $__13 = 1; $__13 < arguments.length; $__13++)
      others[$__13 - 1] = arguments[$__13];
    opts.parent = opts.parent || this;
    opts.sources = opts.sources || [this].concat(others);
    return new Observable(opts);
  },
  map: function(fn) {
    return this.combine({reduce: (function(c) {
        for (var x = [],
            $__14 = 1; $__14 < arguments.length; $__14++)
          x[$__14 - 1] = arguments[$__14];
        return fn.apply((void 0), $traceurRuntime.spread(x));
      })});
  },
  scan: function(fn, init) {
    return this.combine({
      reduce: fn,
      init: init
    });
  },
  filter: function(pred) {
    return this.combine({accept: pred});
  },
  merge: function() {
    var $__17;
    for (var os = [],
        $__14 = 0; $__14 < arguments.length; $__14++)
      os[$__14] = arguments[$__14];
    return ($__17 = this).combine.apply($__17, $traceurRuntime.spread([{endWhen: 'all'}], os));
  },
  zip: function() {
    for (var os = [],
        $__15 = 0; $__15 < arguments.length; $__15++)
      os[$__15] = arguments[$__15];
    os.unshift(this);
    var sources = os.map((function(o) {
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
      return ids.reduce((function(v, id) {
        return v.push(qs[id].shift());
      }), vals());
    });
    var opts = {
      ready: ready,
      reduce: reduce,
      extract: extract,
      init: qs,
      sources: sources,
      parent: this
    };
    return this.combine(opts);
  },
  buffer: function(n) {
    var result = new Observable({
      init: [],
      reduce: function(acc, x) {
        acc.push(x);
        return acc;
      },
      extract: function() {
        var x = this._state;
        this._state = [];
        return x;
      },
      ready: function() {
        return this._state.length >= n;
      }
    });
    this.onNext((function(x) {
      result.next(x);
    }));
    this.onEnd((function() {
      result.broadcast();
      result.end();
    }));
    return result;
  }
});
var Iterable = Matcher((function(v) {
  return !!v[Symbol.iterator];
}));
var stream = overload((function(opts) {
  return new Observable(opts);
})).when('named', [String], (function(name, o) {
  return o.default({name: name});
})).when('values', [Iterable], (function(iterable, o) {
  return o.namedValues('anon', iterable);
})).when('namedValues', [String, Iterable], (function(name, iterable, o) {
  var t = o.default({name: name});
  var current = {};
  var iter = iterable[Symbol.iterator]();
  var nextVal = (function() {
    var $__16 = iter.next(),
        done = $__16.done,
        value = $__16.value;
    if (done) {
      t.end();
      return false;
    }
    t.next(value);
    return true;
  });
  t._priority.loop(nextVal);
  return t;
}));
Object.defineProperties(module.exports, {
  stream: {get: function() {
      return stream;
    }},
  __esModule: {value: true}
});
