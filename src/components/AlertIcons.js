import Alert from "../icons/Alert";
import React, {useMemo} from "react";
import styled from "styled-components";
import Info from "../icons/Info";
import flow from "lodash/flow";
import uniq from "lodash/uniq";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import {getAlertsInEffect} from "../helpers/getAlertsInEffect";

const IconsContainer = styled.div`
  position: absolute;
  bottom: -0.6rem;
  left: 0.45rem;
`;

const IconStyle = styled.div`
  margin-right: 0.1rem;
`;

const decorate = flow(
  observer,
  inject("state")
);

const AlertIcons = decorate(
  ({className, objectWithAlerts, includeNetworkAlerts = false, state}) => {
    const alertLevels = useMemo(
      () =>
        uniq(
          getAlertsInEffect(objectWithAlerts, state.timeMoment, includeNetworkAlerts).map(
            (alert) => alert.level
          )
        ),
      [state.timeMoment, objectWithAlerts, includeNetworkAlerts]
    );

    return (
      <IconsContainer className={className}>
        {alertLevels.map((level) => {
          const Icon = level === "INFO" ? Info : Alert;
          const color = level === "INFO" ? "var(--light-blue)" : "var(--red)";
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
