import React from "react";
import styled from "styled-components";

const AlertsListWrapper = styled.div``;

const Alert = styled.div`
  padding: 0.5rem;
  margin: 0.5rem;
  border-radius: 5px;
  border: 1px solid var(--alt-grey);

  &:first-child {
    margin-top: 0;
  }
`;

const AlertsList = ({alerts}) => {
  return (
    <AlertsListWrapper>
      {alerts.map((alert) => (
        <Alert>
          {alert.alertLevel}: {alert.description}
        </Alert>
      ))}
    </AlertsListWrapper>
  );
};

export default AlertsList;
