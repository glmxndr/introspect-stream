'use strict';

var expectAsync = function (test) {
  return function (done, time) {
    time = time || 15;
    setTimeout(function () {
      try { test(); done(); }
      catch(e) { done(e); }
    }, time);
  };
};

module.exports = {
  expectAsync: expectAsync
};
