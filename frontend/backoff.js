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
