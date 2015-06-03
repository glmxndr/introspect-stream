'use strict';

import _ from 'lodash';
import { overload } from 'introspect-typed';
import { Emitter } from './events';
import { Priority } from './priority';
import { uuid, safe, extend, print, repr } from './utils';

const NEXT = {NEXT: true, toString: () => 'NXT'};
const END = {END: true, toString: () => 'END'};

const LAST_ENDED = function () { if (this._sources.length === 0) { this.end(); } };
const ANY_ENDED = function () { this.end(); };

const OVERRIDABLE = ['name', 'accept', 'reduce', 'ready', 'extract'];

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
    this.plugTo(...this._sources);
  }

};

Observable.prototype = _.extend(Emitter.prototype, {

  /*@override*/
  _accept: () => true,
  _reduce: (current, x) => x,
  _extract: x => x,
  _ready: () => true,
  /*@override*/

  _later: function (fn) { this._priority.push(fn); },

  _unplug: function (pub) {
    this._sources = _(this._sources).without(pub).value();
    this._endingStrategy();
  },

  name: function (n) { return n ? (this._name = n, this) : this._name; },
  toString: function () { return `${this.id} ${this._name || 'anon'}`; },

  plugTo: function (...pubs) {
    pubs.forEach(pub => pub.plug(this));
    return this;
  },
  plug: function (...subs) {
    if (this.ended()) { return this; }
    subs.forEach(sub => {
      var onNext = v => sub.next(v);
      var onEnd = () => sub._unplug(this);
      this.on(NEXT, onNext); this.on(END, onEnd);
      sub.on(END, () => {
        this.off(NEXT, onNext); this.off(END, onEnd);
      });
    });
    return this;
  },
  consume: function (...fns) {
    if (this.ended()) { return this; }
    fns.forEach(fn => this.on(NEXT, safe(fn)));
    return this;
  },

  state: function () { return this._state; },
  ended: function () { return this._state === END; },
  next: function (x) {
    if (this.ended()) { return; }
    if (arguments.length === 0) { return this._state; }
    this._later(() => {
      if (!this._accept(x)) { return this; }
      this._state = this._reduce(this._state, x);
      if (this._ready()) { 
        this.emit(NEXT, this._extract(this._state));
      }
    });
    return this;
  },
  end: function () {
    if (this.ended()) { return; }
    this._later(() => this._state = END, this.emit(END));
    return this;
  },

  log: function () {
    this.on(NEXT, x => print(this, `~( ${x}`));
    this.on(END, () => print(this, `~# END`));
    return this;
  },
  logAs: function (n) { return this.name(n).log(); },

  combine: function (opts, ...others) {
    opts.parent = opts.parent || this;
    opts.sources = opts.sources || [this].concat(others);
    return new Observable(opts);
  },
  map: function (fn) { return this.combine({ reduce: (c,x) => fn(x) }); },
  reduce: function (fn, init) { return this.combine({ reduce: fn, init }); },
  filter: function (pred) { return this.combine({ accept: pred }); },
  merge: function (...os) { return this.combine({endWhen: 'all'}, ...os); },
  zip: function (...os) {
    os.unshift(this);
    var srcs = os.map(o => o.map(x => ({id: o.id, value: x})));
    var ids = _.pluck(os, 'id');
    var qs = {}; // queues
    os.forEach(s => { qs[s.id] = []; });
    var ready = () => (ids.every(id => qs[id].length > 0));
    var reduce = (_, msg) => (qs[msg.id].push(msg.value), qs);
    var extract = () => ids.reduce((r, id) => (r.push(qs[id].shift()), r), []);
    var opts = {ready, reduce, extract, init: qs, sources: srcs, parent: this};
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

var nums = stream([1, 2, 3, 4, 5, 6]).logAs('nums');
var simple100 = nums.map(x => x + 100)//.logAs('100s');

var chars = stream(['a','b','c','d','e']).logAs('chars');
var charnum = chars.zip(nums).logAs('charnum');
charnum.map(x => x[0] + x[1]).logAs('concat')

nums
  .merge(simple100, chars)//.logAs('merged')
  .map(x => x + x)//.logAs('double')
;
