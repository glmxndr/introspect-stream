'use strict';

import _ from 'lodash';
import { Iterable, overload } from 'introspect-typed';
import { Emitter } from './events';
import { Priority } from './priority';
import { Values as vals } from './values';
import { uuid, safe, extend, print, repr } from './utils';

const NEXT = {NEXT: true, toString: () => 'NEXT'};
const END = {END: true, toString: () => 'END'};

const LAST_ENDED = function () { if (this._sources.length === 0) { this.end(); } };
const ANY_ENDED = function () { this.end(); };

/**
 * Apparatus overridable properties.
 * @type {Array}
 */
const OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract', 'complete', 'beforeEnd'];

/**
 * An apparatus receives input, processes it and generates output.
 * The received input provokes asynchronous behavior, changing the state
 * of the apparatus. If the conditions are right, the apparatus may
 * signal out its output (also asynchronously).
 *
 * @method  Apparatus
 * @param   {Object}  opts  the parameters of the apparatus: overriden methods
 *                          declared in the OVERRIDABLE array, the sources of
 *                          input (other apparati), the optional parent apparatus
 *                          (used for scheduling/priorisation), the initial state.
 * @example
 */
var Apparatus = function (opts = {}) {
  Emitter.call(this);
  this.id = uuid('Obs');
  OVERRIDABLE.forEach(p => {  if (opts[p]) { this['_' + p] = opts[p]; } });

  if (opts.parent) { this._priority = opts.parent._priority.child(); }
  else { this._priority = Priority.root; }

  this._state = opts.init || null;
  if (opts.sources) {
    this._endingStrategy = (opts.endWhen === 'all') ? LAST_ENDED : ANY_ENDED;
    this._sources = opts.sources;
    this._plugTo(...this._sources);
  }

};

Apparatus.prototype = _.extend(Emitter.prototype, {

  /*Default overridable behavior components*/
  _accept: () => true,
  _reduce: (current, ...x) => vals(x),
  _extract: x => x,
  _ready: () => true,
  _complete: () => false,
  _beforeEnd: () => {},
  /**/

  _later: function (fn) { this._priority.push(fn); },

  _unplug: function (pub) {
    this._sources = _(this._sources).without(pub).value();
    this._endingStrategy();
  },
  _plugTo: function (...pubs) {
    pubs.forEach(pub => pub._plug(this));
    return this;
  },
  _plug: function (...subs) {
    if (this.ended()) { return this; }
    subs.forEach(sub => {
      var onNext = (...v) => sub.next(...v);
      var onEnd = () => sub._unplug(this);
      this.on(NEXT, onNext); this.on(END, onEnd);
      sub.on(END, () => {
        this.off(NEXT, onNext); this.off(END, onEnd);
      });
    });
    return this;
  },

  name: function (n) { return n ? (this._name = n, this) : this._name; },
  state: function () { return this._state; },
  toString: function () { return `${this.id} ${this._name || 'anon'}`; },

  broadcast: function () {
    this._last = this._extract(this._state);
    this.emit(NEXT, this._last);
  },
  next: function (...x) {
    var v = vals.flatten(...x);
    if (this.ended()) { return; }
    this._later(() => {
      if (!this._accept(...v.args)) { return this; }
      this._state = this._reduce(this._state, ...v.args);
      if (this._ready(this._state)) { this.broadcast(); }
      if (this._complete(this._state)) { this.end(); }
    });
    return this;
  },
  last: function () { return this._last; },
  end: function () {
    if (this.ended()) { return; }
    this._beforeEnd(this._state);
    this._state = END;
    this._later(() => this.emit(END));
    return this;
  },
  ended: function () { return this._state === END; },

  onNext: function (...fns) {
    if (this.ended()) { return this; }
    fns.forEach(fn => this.on(NEXT, safe(fn, this)));
    return this;
  },
  onEnd: function (...fns) {
    if (this.ended()) {
      fns.forEach(fn => safe(fn, this)());
      return this;
    }
    fns.forEach(fn => this.on(END, safe(fn, this)));
    return this;
  },

  log: function () {
    this.on(NEXT, (...x) => { x.pop(); print(this, `~( ${x}`); });
    this.on(END, () => print(this, `~# END`));
    return this;
  },
  logAs: function (n) { return this.name(n).log(); },

  scheduler: function (fn) { return this._priority; },

  branch: function (fn) {
    fn(this);
    return this;
  },

  combine: function (opts, ...others) {
    opts.parent = opts.parent || this;
    opts.sources = opts.sources || [this].concat(others);
    return new Apparatus(opts);
  },

  map: function (fn) {
    return this.combine({ reduce: (c,...x) => fn(...x) });
  },

  scan: function (fn, init) {
    return this.combine({ reduce: fn, init });
  },

  filter: function (pred) {
    return this.combine({ accept: pred });
  },

  merge: function (...os) {
    return this.combine({endWhen: 'all'}, ...os);
  },

  combineLatest: function (...os) {
    os = [this].concat(os);
    var sources = os.map(o => o.map(x => ({id: o.id, value: x})));
    var ids = _.pluck(os, 'id');
    var state = {};
    return this.combine({
      endWhen: 'all',
      init: state,
      reduce: (state, msg) => (state[msg.id] = msg.value, state),
      extract: () => ids.reduce( (v, id) => v.push(state[id]), vals() ),
      parent: this,
      sources
    });
  },

  zip: function (...os) {
    os = [this].concat(os);
    var sources = os.map(o => o.map(x => ({id: o.id, value: x})));
    var ids = _.pluck(os, 'id');
    var qs = _(os).map(s => [s.id, []]).zipObject().value(); // queues
    return this.combine({
      init: qs,
      ready: () => (ids.every(id => qs[id].length > 0)),
      reduce: (_, msg) => (qs[msg.id].push(msg.value), qs),
      extract: () => ids.reduce( (v, id) => v.push(qs[id].shift()), vals() ),
      parent: this,
      sources
    });
  },

  bufferWhile: function (pred) {
    return this.combine({
      init: [],
      reduce: function (state, x) { state.push(x); return state; },
      extract: function (state) { this._state = []; return state; },
      ready: function (state) { return pred(state); },
      beforeEnd: function () { this.broadcast(); }
    });
  },

  buffer: function (n) {
    return this.bufferWhile(state => state.length >= n);
  },

});

export var stream = overload(opts => new Apparatus(opts))
  .when('named',
    [String],
    (name) => stream.default({name}))
  .when('values',
    [Iterable],
    (iterable) => stream.namedValues('anon', iterable))
  .when('namedValues',
    [String, Iterable],
    (name,   iterable) => {
      var t = stream.default({name});
      var current = {};
      var iter = iterable[Symbol.iterator]();
      var nextVal = () => {
        let {done, value} = iter.next();
        if (done) { t.end(); return false; }
        t.next(value); return true;
      };
      t.scheduler().loop(nextVal);
      return t;
    });
