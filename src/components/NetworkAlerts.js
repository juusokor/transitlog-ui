import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import AlertsQuery from "../queries/AlertsQuery";
import {inject} from "../helpers/inject";
import Info from "../icons/Info";
import AlertIcon from "../icons/Alert";

const AlertsContainer = styled.div``;

const AlertItem = styled.div`
  background-color: ${({color = "var(--red)"}) => color};
  padding: 0.25rem 1rem;
  color: white;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const IconStyle = styled.span`
  margin-right: 1rem;
  display: block;
`;

const decorate = flow(
  observer,
  inject("state")
);

const NetworkAlerts = decorate(({state}) => {
  const time = state.date;

  return (
    <AlertsContainer>
      <AlertsQuery time={time}>
        {({alerts = []}) =>
          alerts.map((alert) => {
            let Icon = alert.level === "INFO" ? Info : AlertIcon;
            let color = alert.level === "INFO" ? "var(--light-blue)" : "var(--red)";

            const IconComponent = IconStyle.withComponent(Icon);

            return (
              <AlertItem color={color}>
                <IconComponent width="1rem" fill="white" />
                {alert.title}
              </AlertItem>
            );
          })
        }
      </AlertsQuery>
    </AlertsContainer>
  );
});

export default NetworkAlerts;
