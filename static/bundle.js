(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(callback) {
  // This is the initial delay
  var nextDelay = 1000; // 1 second
  var maxDelay = 120000; // 2 minutes

  // This implements a Fibonacci backoff
  var delay = 0;
  var nextTimeout = function() {
    var currentDelay = Math.min(nextDelay, maxDelay);
    nextDelay += delay;
    delay = currentDelay;

    return currentDelay;
  }

  var timeoutID = -1;
  var onBackoff = function() {
    timeoutID = -1;
    callback(delay);
  };

  return {
    backoff: function() {
      timeoutID = setTimeout(onBackoff, nextTimeout());
    },

    reset: function() {
      delay = 0;
      clearTimeout(timeoutID);
      timeoutID = -1;
    }
  };
};

},{}],2:[function(require,module,exports){
(function(){
  "use strict";

  var body = document.getElementsByTagName('body')[0];

  var applyStyles = function(elem, styles) {
    for (name in styles) {
      elem.style[name] = styles[name];
    }
  };


  var createElementWithStyles = function(elemType, styles) {
    var elem = document.createElement(elemType);
    applyStyles(elem, styles);
    return elem;
  };

  var createBlock = function(rect) {
    var block = document.getElementById(rect.ID);

    if (block === null) {
      block = document.createElement('div');
      block.id = rect.ID;
      body.appendChild(block);
    }

    applyStyles(block, {
      transform: 'translate3d(' + rect.X + 'px, -' + rect.Y+ 'px, 0px)',
      height: rect.Height + 'px',
      width: rect.Width + 'px',
    });

  };

  var messengerFactory = require("./messenger")
  var messenger = messengerFactory();
  console.log("why hello!")
  messenger.onmessage = function(data) {
    var msg = JSON.parse(data);
    createBlock(msg);
  }

  body.addEventListener('keydown', function(e) {
    messenger.send(e.keyCode);
  }, false);

  var wsURL;
  // This is intended for development only
  if (window.notification_url !== undefined) {
    wsURL = window.notification_url;
  } else {
    wsURL = "ws://" + window.location.host + "/whereever";
  }
  messenger.connect(wsURL);
}());

},{"./messenger":3}],3:[function(require,module,exports){
var backoff = require("./backoff");

module.exports = function() {
  var socket;
  return {
    onmessage: function(data) {},
    send: function(data) {
      socket.send(data);
    },
    connect: function(address) {
      var messengerBackoff = backoff(function(delay) {
        socket = new WebSocket(address);
        socket.onopen = onopen;
        socket.onclose = onclose;
        socket.onmessage = onmessage;
      });

      function onopen(event) {
        messengerBackoff.reset();
      }
      function onclose(event) {
        messengerBackoff.backoff();
      }
      var _this = this;
      function onmessage(event) {
        _this.onmessage(event.data);
      }

      // Kick things off
      messengerBackoff.backoff();
    }
  };
}

},{"./backoff":1}]},{},[2]);
