'use strict';

import _ from 'lodash';
import { overload } from 'introspect-typed';
import { Emitter } from './events';
import { Priority } from './priority';
import { Values as vals } from './values';
import { uuid, safe, extend, print, repr } from './utils';

const NEXT = {NEXT: true, toString: () => 'NEXT'};
const END = {END: true, toString: () => 'END'};

const LAST_ENDED = function () { if (this._sources.length === 0) { this.end(); } };
const ANY_ENDED = function () { this.end(); };

const OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract', 'complete'];

var Observable = function (opts = {}) {
  Emitter.call(this);
  this.id = uuid('Obs');
  OVERRIDABLE.forEach(p => {  if (opts[p]) { this['_' + p] = opts[p]; } });

  if (opts.parent) { this._priority = opts.parent._priority.next(); }
  else { this._priority = Priority.root; }

  this._state = opts.init || null;
  if (opts.sources) {
    this._endingStrategy = (opts.endWhen === 'all') ? LAST_ENDED : ANY_ENDED;
    this._sources = opts.sources;
    this._plugTo(...this._sources);
  }

};

Observable.prototype = _.extend(Emitter.prototype, {

  /*@override*/
  _accept: () => true,
  _reduce: (current, ...x) => vals(x),
  _extract: x => x,
  _ready: () => true,
  _complete: () => false,
  /*@override*/

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

  next: function (...x) {
    var v = vals.flatten(...x);
    if (this.ended()) { return; }
    this._later(() => {
      if (!this._accept(...v.args)) { return this; }
      this._state = this._reduce(this._state, ...v.args);
      if (this._ready()) {
        this._last = this._extract(this._state);
        this.emit(NEXT, this._last);
      }
      if (this._complete()) { this.end(); }
    });
    return this;
  },
  last: function () { return this._last; },
  end: function () {
    if (this.ended()) { return; }
    this._state = END;
    this._later(() => this.emit(END));
    return this;
  },
  ended: function () { return this._state === END; },

  consume: function (...fns) {
    if (this.ended()) { return this; }
    fns.forEach(fn => this.on(NEXT, safe(fn, this)));
    return this;
  },

  log: function () {
    this.on(NEXT, (...x) => print(this, `~( ${x}`));
    this.on(END, () => print(this, `~# END`));
    return this;
  },
  logAs: function (n) { return this.name(n).log(); },

  schedule: function (fn) {
    this._priority.push(fn);
    return this;
  },
  scheduleWhile: function (fn) {
    this._priority.loop(fn);
    return this;
  },
  run: function () {
    this.scheduleWhile(() => (this.next(), !this.ended()));
  },

  branch: function (fn) {
    fn(this);
    return this;
  },

  combine: function (opts, ...others) {
    opts.parent = opts.parent || this;
    opts.sources = opts.sources || [this].concat(others);
    return new Observable(opts);
  },

  map: function (fn) {
    return this.combine({ reduce: (c,...x) => fn(...x) });
  },

  reduce: function (fn, init) {
    return this.combine({ reduce: fn, init });
  },

  filter: function (pred) {
    return this.combine({ accept: pred });
  },

  merge: function (...os) {
    return this.combine({endWhen: 'all'}, ...os);
  },

  zip: function (...os) {
    os.unshift(this);
    var sources = os.map(o => o.map(x => ({id: o.id, value: x})));
    var ids = _.pluck(os, 'id');
    var qs = {}; // queues
    os.forEach(s => { qs[s.id] = []; });
    var ready = () => (ids.every(id => qs[id].length > 0));
    var reduce = (_, msg) => (qs[msg.id].push(msg.value), qs);
    var extract = () => ids.reduce( (v, id) => v.push(qs[id].shift()), vals() );
    var opts = {ready, reduce, extract, init: qs, sources , parent: this};
    return this.combine(opts);
  }
});

export var stream = overload(opts => new Observable(opts))
  .when('named', [String], (name, o) => o.default({name}))
  .when('values', [Array], (values, o) => o.namedValues('anon', values))
  .when('namedValues', [String, Array], (name, values, o) => {
    var t = o.default({name});
    var nextVal = () => (values.length ? (t.next(values.shift()), true)
                      : (t.end(), false));
    t._priority.loop(nextVal);
    return t;
  });

// var couples = stream('nums', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).log()
//   .map(n => vals([n, n*n+1])).logAs('couples')
//   .filter(function (x, y) { return (y % 2 === 0); }).logAs('filtered')
//     .branch(f => f.map((x, y) => x).logAs('evenX'))
//     .branch(f => f.map((x, y) => y).logAs('oddY'));

var fibo = stream({
  name: 'fibo',
  init: [0,1],
  reduce: acc => [acc[1], acc[0] + acc[1]],
  extract: state => state[0],
  complete: function () { return this._state[0] === Infinity; }
}).log().run();
