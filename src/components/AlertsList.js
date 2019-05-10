import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import AlertItem from "./AlertItem";
import {getAlertKey} from "../helpers/getAlertKey";

const AlertsListWrapper = styled.div`
  padding: 0 0 1rem;
`;

const decorate = flow(observer);

const AlertsList = decorate(({className, alerts = []}) => {
  const validAlerts = alerts && Array.isArray(alerts) ? alerts : [];

  return (
    <AlertsListWrapper className={className}>
      {validAlerts.map((alert) => (
        <AlertItem key={getAlertKey(alert)} alert={alert} />
      ))}
    </AlertsListWrapper>
  );
});

export default AlertsList;
