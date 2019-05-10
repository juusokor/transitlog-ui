import {Heading} from "../Typography";
import StopRouteSelect from "./StopRouteSelect";
import {Text} from "../../helpers/text";
import React from "react";
import styled from "styled-components";
import AlertsList, {AlertItem} from "../AlertsList";
import {StopContent} from "../StopElements";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import {Button} from "../Forms";

export const StopAlerts = styled(AlertsList)`
  padding: 0;
  margin-top: 1rem;

  ${AlertItem} {
    font-family: inherit;
  }
`;

export const StopPopupContentSection = styled.div`
  padding: 0 1rem;

  &:first-child {
    padding-top: 1rem;
  }

  &:last-child {
    padding-bottom: 1rem;
  }
`;

export const StopContentWrapper = styled(StopContent)`
  font-family: inherit;
  font-size: 1rem;
  padding: 0;
`;

const StopPopupContent = ({date, color, stop, onSelectRoute, onShowStreetView}) => {
  return (
    <StopContentWrapper>
      <StopPopupContentSection>
        <Heading level={4}>
          {stop.name}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        {onSelectRoute && (
          <StopRouteSelect
            color={color}
            onSelectRoute={onSelectRoute}
            stopId={stop.stopId}
            date={date}
          />
        )}
      </StopPopupContentSection>
      {stop && <StopAlerts alerts={getAlertsInEffect(stop, date)} />}
      <StopPopupContentSection style={{display: "flex", justifyContent: "center"}}>
        <Button onClick={onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </Button>
      </StopPopupContentSection>
    </StopContentWrapper>
  );
};

export default StopPopupContent;
