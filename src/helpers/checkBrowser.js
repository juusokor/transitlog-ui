import Sniffer from "snifferjs";

const allowedEngines = ["webkit", "gecko"];

export function checkBrowser() {
  const ua = window.navigator.userAgent;
  const engine = Sniffer(ua).browser.engine;

  if (!allowedEngines.includes(engine)) {
    window.alert(
      "Your browser is not supported. Please use Transitlog with Chrome or Firefox."
    );
  }
}
