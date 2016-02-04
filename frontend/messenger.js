var backoff = require("./backoff");

module.exports = function() {
  return {
    onmessage: function(data) {},
    connect: function(address) {
      var messengerBackoff = backoff(function(delay) {
        var socket = new WebSocket(address);
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
