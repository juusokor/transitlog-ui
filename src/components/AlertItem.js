import {getAlertKey} from "../helpers/getAlertKey";
import Website from "../icons/Website";
import React from "react";
import {getAlertStyle} from "../helpers/getAlertStyle";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";
import styled from "styled-components";
import {Heading} from "./Typography";
import ToggleView from "./ToggleView";
import {observer} from "mobx-react-lite";
import {AlertDistribution} from "../helpers/getAlertsInEffect";
import BusStop from "../icons/BusStop";
import JourneyPlanner from "../icons/JourneyPlanner";
import HSLLogoNoText from "../icons/HSLLogoNoText";
import {text} from "../helpers/text";

const AlertComponent = styled.div`
  font-family: var(--font-family);

  &:first-child {
    margin-top: 0;
  }

  &:nth-child(odd) {
    background: rgba(0, 0, 0, 0.03);
  }
`;

const AlertHeader = styled.div`
  width: 100%;
  padding: 0.75rem 1rem;

  svg {
    display: block;
    margin-right: 0.75rem;
  }
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;
  margin-bottom: 0.75rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AlertType = styled.span`
  margin-right: 1rem;
  flex: 1 1 auto;

  svg {
    display: inline-block;
    margin-right: 0.5rem;
  }
`;

const AlertContent = styled.div`
  width: 100%;
  padding: 0 1rem 0.75rem;
`;

const AlertTime = styled.div`
  font-size: 0.875rem;
  text-align: right;
  margin-left: auto;

  svg {
    margin: 0 1rem;
  }

  strong {
    font-size: 0.87rem;
    font-weight: bold;
  }

  span {
    font-size: 0.7rem;
  }
`;

const AlertTitle = styled(Heading).attrs({level: 5})`
  margin: 0;
  font-size: 0.875rem;
  font-weight: normal;
`;

const AlertDescription = styled.div`
  margin: 0 0 1rem;
  font-size: 0.875rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--lighter-grey);
`;

const AlertInfo = styled.div`
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
`;

const AlertInfoRow = styled.div`
  padding: 0.5rem 0 0;
`;

const AlertPublishTime = styled.span`
  font-size: 0.75rem;
  margin-left: auto;
  color: var(--light-grey);
`;

const AlertFooter = styled.div`
  margin-top: 0.375rem;
  padding-top: 0.375rem;
  border-top: 1px solid var(--alt-grey);
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const AlertLink = styled.a``;

const Accordion = styled(ToggleView)`
  button {
    text-decoration: none;
    color: inherit;
    width: 100%;
    display: block;
  }
`;

const AlertTimeDisplay = observer(({alert}) => {
  const startMoment = moment.tz(alert.startDateTime, TIMEZONE);
  const endMoment = moment.tz(alert.endDateTime, TIMEZONE);

  const startDate = startMoment.format("MM/DD");
  const endDate = endMoment.format("MM/DD");
  const startTime = startMoment.format("HH:mm");
  const endTime = endMoment.format("HH:mm");

  return (
    <AlertTime>
      {startDate === endDate ? (
        <>
          <span>{startDate} </span>
          <strong>
            {startTime} - {endTime}
          </strong>
        </>
      ) : (
        <>
          <span>{startDate} </span>
          <strong>{startTime} </strong>- <span>{endDate} </span>
          <strong>{endTime}</strong>
        </>
      )}
    </AlertTime>
  );
});

const AlertItem = observer(({alert}) => {
  const {Icon, color} = getAlertStyle(alert);

  const publishedMoment = moment.tz(alert.publishedDateTime, TIMEZONE);
  const updatedMoment = alert.updatedDateTime
    ? moment.tz(alert.updatedDateTime, TIMEZONE)
    : null;

  let TypeIcon = HSLLogoNoText;
  let type = "network";

  if (
    [AlertDistribution.AllRoutes, AlertDistribution.Route].includes(alert.distribution)
  ) {
    TypeIcon = JourneyPlanner;
    type = "route";
  }

  if ([AlertDistribution.AllStops, AlertDistribution.Stop].includes(alert.distribution)) {
    TypeIcon = BusStop;
    type = "stop";
  }

  return (
    <AlertComponent key={getAlertKey(alert)}>
      <Accordion
        label={
          <AlertHeader>
            <Row>
              <Icon width="1.25rem" fill={color} />
              <AlertType>
                {TypeIcon && <TypeIcon fill="var(--grey)" width="1rem" />}
                {alert.affectedId || type === "route"
                  ? text("domain.alerts.all_routes")
                  : type === "stop"
                  ? text("domain.alerts.all_stops")
                  : text("domain.alerts.network")}
              </AlertType>
              <AlertTimeDisplay alert={alert} />
            </Row>
            <Row>
              <AlertTitle>{alert.title}</AlertTitle>
            </Row>
          </AlertHeader>
        }>
        <AlertContent>
          <AlertDescription style={{marginBottom: "0.75rem"}}>
            {alert.description}
          </AlertDescription>
          <AlertInfo>
            <AlertInfoRow>
              {text("general.category")}: <strong>{alert.category}</strong>
            </AlertInfoRow>
            <AlertInfoRow>
              {text("general.impact")}: <strong>{alert.impact}</strong>
            </AlertInfoRow>
          </AlertInfo>
          <AlertFooter>
            {alert.url && (
              <AlertLink target="_blank" href={alert.url}>
                <Website width="1.25rem" fill="var(--light-grey)" />
              </AlertLink>
            )}
            <AlertPublishTime>
              {updatedMoment ? (
                <span>
                  {updatedMoment.format("MM/DD")}, {updatedMoment.format("HH:mm")}
                </span>
              ) : (
                <span>
                  {publishedMoment.format("MM/DD")}, {publishedMoment.format("HH:mm")}
                </span>
              )}
            </AlertPublishTime>
          </AlertFooter>
        </AlertContent>
      </Accordion>
    </AlertComponent>
  );
});

export default AlertItem;
