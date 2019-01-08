import {Heading} from "../../Typography";
import {TransportIcon} from "../../transportModes";
import React from "react";
import styled from "styled-components";
import Calendar from "../../../icons/Calendar";
import JourneyPlanner from "../../../icons/JourneyPlanner";
import Time2 from "../../../icons/Time2";

const JourneyPanelHeader = styled.div`
  flex: none;
  padding: 1rem 1rem 1.5rem 2rem;
  border-bottom: 1px solid var(--lighter-grey);

  > * {
    display: flex;
    align-items: flex-end;
  }

  > *:first-child {
    margin-top: 0;
  }

  > *:last-child {
    margin-bottom: 0;
  }

  svg {
    margin-left: -0.2rem;
    margin-right: 0.5rem;
  }
`;

const LineNameHeading = styled(Heading).attrs({level: 4})`
  font-weight: normal;
`;

const HeaderText = styled.span`
  font-weight: normal;
  margin-left: 1.5rem;
  display: inline-flex;
  align-items: center;
  font-size: 0.875rem;
  padding-bottom: 1px;

  &:first-child {
    margin-left: 0;
  }

  svg {
    margin-left: 0;
  }
`;

const DateTimeHeading = styled.div``;

export default ({mode, desi, routeId, date, time, name, vehicleId}) => {
  return (
    <JourneyPanelHeader>
      <Heading level={3}>
        <TransportIcon width={23} height={23} mode={mode} />
        {desi}
        <HeaderText>
          <JourneyPlanner fill="var(--blue)" width="1rem" height="1rem" />
          {routeId}
        </HeaderText>
        <HeaderText>
          <TransportIcon mode={mode} width={17} height={17} />
          {vehicleId}
        </HeaderText>
      </Heading>
      <DateTimeHeading>
        <HeaderText>
          <Calendar fill="var(--blue)" width="1rem" height="1rem" />
          {date}
        </HeaderText>
        <HeaderText>
          <Time2 fill="var(--blue)" width="1rem" height="1rem" />
          {time}
        </HeaderText>
      </DateTimeHeading>
      <LineNameHeading>{name}</LineNameHeading>
    </JourneyPanelHeader>
  );
};
