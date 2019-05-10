import {getAlertKey} from "../helpers/getAlertKey";
import Website from "../icons/Website";
import ArrowRightLong from "../icons/ArrowRightLong";
import React from "react";
import {getAlertStyle} from "../helpers/getAlertStyle";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import styled from "styled-components";
import {Heading} from "./Typography";

const AlertComponent = styled.div`
  padding: 0.75rem 1rem;
  display: grid;
  grid-template-columns: 2.5rem 1fr;
  grid-gap: 1rem;
  align-items: start;
  justify-items: start;
  font-family: var(--font-family);

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(odd) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const AlertIconWrapper = styled.div`
  justify-self: start;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  flex-direction: column;

  svg {
    margin-bottom: 1rem;
  }
`;

const AlertContent = styled.div`
  width: 100%;
`;

const AlertTime = styled.div`
  font-size: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 0.5rem;
  margin: 0 0 1rem;
  border-bottom: 1px solid var(--alt-grey);
  max-width: 20rem;

  svg {
    margin: 0 1rem;
  }
`;

const TimeBox = styled.div`
  display: flex;
  flex-direction: column;
  font-size: 0.75rem;

  &:last-child {
    text-align: right;
  }

  strong {
    font-size: 1rem;
    font-weight: normal;
    display: block;
  }

  span {
    display: block;
  }
`;

const AlertTitle = styled(Heading).attrs({level: 5})`
  margin: 0 0 0.5rem;
  max-width: 20rem;
`;

const AlertDescription = styled.div`
  margin: 0.25rem 0 1rem;
  font-size: 0.875rem;
  max-width: 20rem;
`;

const AlertPublishTime = styled.span`
  font-size: 0.75rem;
  align-items: center;
`;

const AlertLink = styled.a``;

const AlertItem = ({alert}) => {
  const {Icon, color} = getAlertStyle(alert);

  const startMoment = moment.tz(alert.startDateTime, TIMEZONE);
  const endMoment = moment.tz(alert.endDateTime, TIMEZONE);
  const publishedMoment = moment.tz(alert.publishedDateTime, TIMEZONE);
  const updatedMoment = alert.updatedDateTime
    ? moment.tz(alert.updatedDateTime, TIMEZONE)
    : null;

  const startDate = startMoment.format("MM/DD");
  const endDate = endMoment.format("MM/DD");
  const startTime = startMoment.format("HH:mm");
  const endTime = endMoment.format("HH:mm");

  return (
    <AlertComponent key={getAlertKey(alert)}>
      <AlertIconWrapper>
        <Icon width="1.5rem" fill={color} />
        {alert.url && (
          <AlertLink target="_blank" href={alert.url}>
            <Website width="1.5rem" fill="var(--light-grey)" />
          </AlertLink>
        )}
        <AlertPublishTime>
          {updatedMoment ? (
            <span>
              {updatedMoment.format("MM/DD")}
              <br />
              {updatedMoment.format("HH:mm")}
              <br />
            </span>
          ) : (
            <span>
              {publishedMoment.format("MM/DD")}
              <br />
              {publishedMoment.format("HH:mm")}
              <br />
            </span>
          )}
        </AlertPublishTime>
      </AlertIconWrapper>
      <AlertContent>
        <AlertTime>
          <TimeBox>
            <strong>{startTime}</strong>
            <span>{startDate}</span>
          </TimeBox>
          <ArrowRightLong fill="var(--light-grey)" width="1rem" />
          <TimeBox>
            <strong>{endTime}</strong>
            <span>{endDate}</span>
          </TimeBox>
        </AlertTime>
        <AlertTitle>{alert.title}</AlertTitle>
        <AlertDescription style={{marginBottom: "0.75rem"}}>
          {alert.description}
        </AlertDescription>
      </AlertContent>
    </AlertComponent>
  );
};

export default AlertItem;
