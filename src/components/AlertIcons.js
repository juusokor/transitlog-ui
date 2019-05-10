import React, {useMemo} from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import uniq from "lodash/uniq";
import {observer} from "mobx-react-lite";
import {getAlertsInEffect} from "../helpers/getAlertsInEffect";
import {getAlertStyle} from "../helpers/getAlertStyle";

const IconsContainer = styled.div`
  position: absolute;
  bottom: -0.6rem;
  left: 0.45rem;
`;

const IconStyle = styled.div`
  margin-right: 0.1rem;
`;

const decorate = flow(observer);

const AlertIcons = decorate(
  ({className, objectWithAlerts, includeNetworkAlerts = false, time = null}) => {
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
            <IconComponent key={level} fill={color} width="0.7rem" height="0.7rem" />
          );
        })}
      </IconsContainer>
    );
  }
);

export default AlertIcons;
