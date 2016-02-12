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
