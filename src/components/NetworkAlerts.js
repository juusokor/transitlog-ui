import React from "react";
import flow from "lodash/flow";
import {observer} from "mobx-react-lite";
import styled, {css} from "styled-components";
import AlertsQuery from "../queries/AlertsQuery";
import {inject} from "../helpers/inject";
import format from "date-fns/format";
import {getAlertStyle} from "../helpers/getAlertStyle";
import Time from "../icons/Time";

const AlertsContainer = styled.div``;

const AlertItem = styled.div`
  background-color: ${({color = "var(--red)"}) => color};
  padding: 0.25rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const IconStyle = styled.span`
  margin-right: 0.75rem;
`;

const AlertInfoWrapper = styled.span`
  flex: 1 1 auto;
`;

const AlertInfo = styled.span`
  font-size: 0.75rem;

  ${({separator = ""}) =>
    separator
      ? css`
  &:after {
    content: "${separator}";
    margin-right: 0.25rem;
  }
`
      : css`
          &:after {
            content: "";
            margin-right: 0.25rem;
          }
        `}
`;

const AlertTime = styled.span`
  margin-left: auto;
  font-size: 0.75rem;
  flex: 1 1 auto;
  text-align: right;

  svg {
    margin-right: 0.5rem;
    margin-bottom: -2px;
  }
`;

const AlertTitle = styled.span`
  font-weight: bold;
  flex: 1 1 auto;
  text-align: center;
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
        {({alerts = []}) => {
          return alerts.map((alert) => {
            const {Icon, color} = getAlertStyle(alert, true);
            const IconComponent = IconStyle.withComponent(Icon);

            const startDate = format(alert.startDateTime, "MM/DD");
            const startTime = format(alert.startDateTime, "HH:mm");

            const endDate = format(alert.endDateTime, "MM/DD");
            const endTime = format(alert.endDateTime, "HH:mm");

            return (
              <AlertItem
                color={color}
                key={
                  alert.title +
                  alert.level +
                  alert.distribution +
                  alert.startDateTime +
                  alert.endDateTime
                }>
                <AlertInfoWrapper>
                  <IconComponent width="1rem" fill="var(--dark-grey)" />
                  <AlertInfo separator=" /">{alert.level}</AlertInfo>
                  <AlertInfo separator=" /">{alert.category}</AlertInfo>
                  <AlertInfo>{alert.impact}</AlertInfo>
                </AlertInfoWrapper>
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertTime>
                  <Time fill="var(--dark-grey)" width="0.75rem" />
                  {startDate === endDate
                    ? `${startDate}, ${startTime} - ${endTime}`
                    : `${startDate} ${startTime} - ${endDate} ${endTime}`}
                </AlertTime>
              </AlertItem>
            );
          });
        }}
      </AlertsQuery>
    </AlertsContainer>
  );
});

export default NetworkAlerts;
