import React from "react";
import styled from "styled-components";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import AlertItem from "./AlertItem";
import {getAlertKey} from "../helpers/getAlertKey";
import {ListHeading} from "./commonComponents";
import {Text} from "../helpers/text";

const AlertsListWrapper = styled.div`
  padding-bottom: 1rem;
`;

const decorate = flow(observer);

const AlertsList = decorate(({className, alerts = [], showListHeading = false}) => {
  const validAlerts = alerts && Array.isArray(alerts) ? alerts : [];

  return (
    <AlertsListWrapper className={className}>
      {showListHeading && (
        <ListHeading>
          <Text>domain.alerts.subset</Text>
        </ListHeading>
      )}
      {validAlerts.map((alert) => (
        <AlertItem key={getAlertKey(alert)} alert={alert} />
      ))}
    </AlertsListWrapper>
  );
});

export default AlertsList;
