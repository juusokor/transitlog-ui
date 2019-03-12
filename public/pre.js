/* eslint-disable */

(function() {
  var allowedEngines = ["webkit", "gecko"];
  var engine = window.Sniff.browser.engine;

  if (allowedEngines.indexOf(engine) === -1) {
    window.alert(
      "Your browser is not supported. Please use Transitlog with Chrome or Firefox."
    );
  }
})();
