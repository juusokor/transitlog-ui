import Alert from "../icons/Alert";
import React from "react";
import styled from "styled-components";
import Info from "../icons/Info";

const IconsContainer = styled.div`
  position: absolute;
  bottom: -0.6rem;
  left: 0.45rem;
`;

const IconStyle = styled.div`
  margin-right: 0.1rem;
`;

const AlertLevel = {
  Info: "INFO",
  Warning: "WARNING",
  Severe: "SEVERE",
};

const AlertDistribution = {
  Stop: "STOP",
  AllStops: "ALL_STOPS",
  Route: "ROUTE",
  AllRoutes: "ALL_ROUTES",
  Network: "NETWORK",
};

const AlertIcons = ({className, objectWithAlerts, includeNetworkAlerts = false}) => {
  if (
    !objectWithAlerts.alerts ||
    !Array.isArray(objectWithAlerts.alerts) ||
    objectWithAlerts.alerts.length === 0
  ) {
    return null;
  }

  const alertLevels = objectWithAlerts.alerts
    .reduce((levels, alert) => {
      if (levels.includes(alert.level)) {
        return levels;
      }

      if (includeNetworkAlerts && alert.distribution === AlertDistribution.Network) {
        levels.push(alert.level);
      } else if (
        (alert.distribution === AlertDistribution.Route &&
          objectWithAlerts.routeId === alert.affectedId) ||
        (alert.distribution === AlertDistribution.AllRoutes &&
          typeof objectWithAlerts.routeId !== "undefined")
      ) {
        levels.push(alert.level);
      } else if (
        (alert.distribution === AlertDistribution.Stop &&
          objectWithAlerts.stopId === alert.affectedId) ||
        (alert.distribution === AlertDistribution.AllStops &&
          typeof objectWithAlerts.stopId !== "undefined")
      ) {
        levels.push(alert.level);
      }

      return levels;
    }, [])
    .sort((a, b) => {
      const sortVal = {
        [AlertLevel.Severe]: 2,
        [AlertLevel.Warning]: 1,
        [AlertLevel.Info]: 0,
      };

      return sortVal[a] >= sortVal[b] ? -1 : 1;
    });

  return (
    <IconsContainer className={className}>
      {alertLevels.map((level) => {
        const Icon = level === "INFO" ? Info : Alert;
        const color = level === "INFO" ? "var(--light-blue)" : "var(--red)";

        const IconComponent = IconStyle.withComponent(Icon);

        return <IconComponent fill={color} width="0.7rem" height="0.7rem" />;
      })}
    </IconsContainer>
  );
};

export default AlertIcons;
