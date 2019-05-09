import {Heading} from "../Typography";
import StopRouteSelect from "./StopRouteSelect";
import {Text} from "../../helpers/text";
import React from "react";
import styled from "styled-components";
import AlertsList, {AlertItem} from "../AlertsList";
import {StopContent} from "../StopElements";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import {getMomentFromDateTime} from "../../helpers/time";

export const StopAlerts = styled(AlertsList)`
  padding: 0;
  margin-top: 1rem;

  ${AlertItem} {
    font-family: inherit;
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
      {stop && (
        <StopAlerts alerts={getAlertsInEffect(stop, getMomentFromDateTime(date))} />
      )}
      <button onClick={onShowStreetView}>
        <Text>map.stops.show_in_streetview</Text>
      </button>
    </StopContentWrapper>
  );
};

export default StopPopupContent;
