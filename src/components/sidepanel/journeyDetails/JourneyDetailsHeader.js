import {Heading} from "../../Typography";
import {TransportIcon} from "../../transportModes";
import React from "react";
import styled from "styled-components";

const JourneyPanelHeader = styled.div`
  padding: 1rem 1rem 0 2rem;

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

const RouteIdDisplay = styled.span`
  font-weight: normal;
  margin-left: 0.5rem;
`;

export default ({mode, desi, routeId, name}) => (
  <JourneyPanelHeader>
    <Heading level={3}>
      <TransportIcon width={23} height={23} mode={mode} />
      {desi}
      <RouteIdDisplay>{routeId}</RouteIdDisplay>
    </Heading>
    <LineNameHeading>{name}</LineNameHeading>
  </JourneyPanelHeader>
);
