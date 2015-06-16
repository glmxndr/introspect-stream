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
    Iterable = $__1.Iterable,
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
var OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract', 'complete', 'beforeEnd'];
var Apparatus = function() {
  var $__18;
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
    ($__18 = this)._plugTo.apply($__18, $traceurRuntime.spread(this._sources));
  }
};
Apparatus.prototype = _.extend(Emitter.prototype, {
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
  _beforeEnd: (function() {}),
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
        var $__18;
        for (var v = [],
            $__10 = 0; $__10 < arguments.length; $__10++)
          v[$__10] = arguments[$__10];
        return ($__18 = sub).next.apply($__18, $traceurRuntime.spread(v));
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
    var $__18;
    for (var x = [],
        $__10 = 0; $__10 < arguments.length; $__10++)
      x[$__10] = arguments[$__10];
    var $__6 = this;
    var v = ($__18 = vals).flatten.apply($__18, $traceurRuntime.spread(x));
    if (this.ended()) {
      return ;
    }
    this._later((function() {
      var $__19,
          $__20;
      if (!($__19 = $__6)._accept.apply($__19, $traceurRuntime.spread(v.args))) {
        return $__6;
      }
      $__6._state = ($__20 = $__6)._reduce.apply($__20, $traceurRuntime.spread([$__6._state], v.args));
      if ($__6._ready($__6._state)) {
        $__6.broadcast();
      }
      if ($__6._complete($__6._state)) {
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
    this._beforeEnd(this._state);
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
    return new Apparatus(opts);
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
    var $__18;
    for (var os = [],
        $__14 = 0; $__14 < arguments.length; $__14++)
      os[$__14] = arguments[$__14];
    return ($__18 = this).combine.apply($__18, $traceurRuntime.spread([{endWhen: 'all'}], os));
  },
  combineLatest: function() {
    for (var os = [],
        $__15 = 0; $__15 < arguments.length; $__15++)
      os[$__15] = arguments[$__15];
    os = [this].concat(os);
    var sources = os.map((function(o) {
      return o.map((function(x) {
        return ({
          id: o.id,
          value: x
        });
      }));
    }));
    var ids = _.pluck(os, 'id');
    var state = {};
    return this.combine({
      endWhen: 'all',
      init: state,
      reduce: (function(state, msg) {
        return (state[msg.id] = msg.value, state);
      }),
      extract: (function() {
        return ids.reduce((function(v, id) {
          return v.push(state[id]);
        }), vals());
      }),
      parent: this,
      sources: sources
    });
  },
  zip: function() {
    for (var os = [],
        $__16 = 0; $__16 < arguments.length; $__16++)
      os[$__16] = arguments[$__16];
    os = [this].concat(os);
    var sources = os.map((function(o) {
      return o.map((function(x) {
        return ({
          id: o.id,
          value: x
        });
      }));
    }));
    var ids = _.pluck(os, 'id');
    var qs = _(os).map((function(s) {
      return [s.id, []];
    })).zipObject().value();
    return this.combine({
      init: qs,
      ready: (function() {
        return (ids.every((function(id) {
          return qs[id].length > 0;
        })));
      }),
      reduce: (function(_, msg) {
        return (qs[msg.id].push(msg.value), qs);
      }),
      extract: (function() {
        return ids.reduce((function(v, id) {
          return v.push(qs[id].shift());
        }), vals());
      }),
      parent: this,
      sources: sources
    });
  },
  bufferWhile: function(pred) {
    return this.combine({
      init: [],
      reduce: function(state, x) {
        state.push(x);
        return state;
      },
      extract: function(state) {
        this._state = [];
        return state;
      },
      ready: function(state) {
        return pred(state);
      },
      beforeEnd: function() {
        this.broadcast();
      }
    });
  },
  buffer: function(n) {
    return this.bufferWhile((function(state) {
      return state.length >= n;
    }));
  }
});
var stream = overload((function(opts) {
  return new Apparatus(opts);
})).when('named', [String], (function(name) {
  return stream.default({name: name});
})).when('values', [Iterable], (function(iterable) {
  return stream.namedValues('anon', iterable);
})).when('namedValues', [String, Iterable], (function(name, iterable) {
  var t = stream.default({name: name});
  var current = {};
  var iter = iterable[Symbol.iterator]();
  var nextVal = (function() {
    var $__17 = iter.next(),
        done = $__17.done,
        value = $__17.value;
    if (done) {
      t.end();
      return false;
    }
    t.next(value);
    return true;
  });
  t.scheduler().loop(nextVal);
  return t;
}));
Object.defineProperties(module.exports, {
  stream: {get: function() {
      return stream;
    }},
  __esModule: {value: true}
});
