import Info from "../icons/Info";
import AlertIcon from "../icons/Alert";
import {AlertLevel} from "./getAlertsInEffect";

export const getAlertStyle = (alert, asBackgroundColor = false) => {
  let Icon = alert.level === AlertLevel.Info ? Info : AlertIcon;
  let color =
    alert.level === AlertLevel.Info
      ? "var(--light-blue)"
      : alert.level === AlertLevel.Warning
      ? "var(--yellow)"
      : "var(--red)";

  if (asBackgroundColor && alert.level === AlertLevel.Severe) {
    color = "var(--pink)";
  }

  return {Icon, color};
};
