import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import uniq from "lodash/uniq";
import {observer} from "mobx-react-lite";
import {getAlertsInEffect} from "../helpers/getAlertsInEffect";
import {getAlertStyle} from "../helpers/getAlertStyle";
import {inject} from "../helpers/inject";

const IconsContainer = styled.div`
  position: absolute;
  bottom: -0.35rem;
  left: 0.45rem;
`;

const IconStyle = styled.div`
  margin-right: 0.1rem;

  &:last-child {
    margin-right: 0;
  }
`;

const decorate = flow(
  observer,
  inject("state")
);

const AlertIcons = decorate(
  ({
    className,
    state: {timeMoment},
    objectWithAlerts,
    includeNetworkAlerts = false,
    time = timeMoment,
    iconSize = "0.7rem",
  }) => {
    const alertLevels = useMemo(
      () =>
        uniq(
          getAlertsInEffect(objectWithAlerts, time, includeNetworkAlerts).map(
            (alert) => alert.level
          )
        ),
      [objectWithAlerts, includeNetworkAlerts, time]
    );

    return (
      <IconsContainer className={className}>
        {alertLevels.map((level) => {
          const {Icon, color} = getAlertStyle(level);
          const IconComponent = IconStyle.withComponent(Icon);
          return (
            <IconComponent key={level} fill={color} width={iconSize} height={iconSize} />
          );
        })}
      </IconsContainer>
    );
  }
);

export default AlertIcons;
