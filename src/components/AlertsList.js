import React from "react";
import styled from "styled-components";
import Info from "../icons/Info";
import AlertIcon from "../icons/Alert";
import {TIMEZONE} from "../constants";
import moment from "moment-timezone";

const AlertsListWrapper = styled.div`
  padding: 0.75rem 0 1rem;
`;

export const AlertItem = styled.div`
  padding: 0.75rem 1rem;
  display: grid;
  grid-template-columns: 1.5rem 1fr;
  grid-gap: 1rem;
  align-items: start;
  justify-items: start;

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const AlertIconWrapper = styled.div`
  justify-self: start;
`;

const AlertContent = styled.div`
  width: 100%;
`;

const AlertTime = styled.div`
  display: flex;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;

  span {
    margin-left: auto;
  }
`;

const AlertLink = styled.a`
  font-size: 0.75rem;
`;

const AlertsList = ({className, alerts = []}) => {
  const validAlerts = !!alerts && Array.isArray(alerts) ? alerts : [];

  return (
    <AlertsListWrapper className={className}>
      {validAlerts.map((alert) => {
        let Icon = alert.alertLevel === "NOTICE" ? Info : AlertIcon;
        let color = alert.alertLevel === "NOTICE" ? "var(--light-blue)" : "var(--red)";

        const startMoment = moment.tz(alert.startDateTime, TIMEZONE);
        const endMoment = moment.tz(alert.endDateTime, TIMEZONE);
        const startDate = startMoment.format("YYYY-MM-DD");
        const endDate = endMoment.format("YYYY-MM-DD");
        const startTime = startMoment.format("HH:mm");
        const endTime = endMoment.format("HH:mm");

        return (
          <AlertItem key={alert.id}>
            <AlertIconWrapper>{<Icon width="1.25rem" fill={color} />}</AlertIconWrapper>
            <AlertContent>
              {startDate === endDate ? (
                <AlertTime>
                  <strong>
                    {startTime} - {endTime}
                  </strong>
                  <span>{startDate}</span>
                </AlertTime>
              ) : (
                <AlertTime>
                  <strong>
                    {startDate} {startTime} - {endDate} {endTime}
                  </strong>
                </AlertTime>
              )}
              <div style={{marginBottom: "0.5rem"}}>{alert.description}</div>
              {alert.url && (
                <AlertLink target="_blank" href={alert.url}>
                  Read more
                </AlertLink>
              )}
            </AlertContent>
          </AlertItem>
        );
      })}
    </AlertsListWrapper>
  );
};

export default AlertsList;
