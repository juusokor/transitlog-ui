import React from "react";
import {Tooltip, Popup} from "react-leaflet";
import {latLng} from "leaflet";
import {observer, inject} from "mobx-react";
import {P} from "../Typography";
import {ColoredBackgroundSlot, PlainSlot, PlainSlotSmall, TagButton} from "../TagButton";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import {
  getNormalTime,
  timeToSeconds,
  secondsToTime,
  secondsToTimeObject,
} from "../../helpers/time";
import {Text} from "../../helpers/text";
import {app} from "mobx-app";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import doubleDigit from "../../helpers/doubleDigit";
import {
  TimeHeading,
  StopHeading,
  StopContent,
  StopArrivalTime,
  SmallText,
} from "../StopElements";
import CalculateTerminalTime from "../sidepanel/journeyDetails/CalculateTerminalTime";
import RouteStopMarker from "./RouteStopMarker";
import getDelayType from "../../helpers/getDelayType";

const PopupParagraph = styled(P)`
  font-family: var(--font-family);
  font-size: 1rem;
`;

const TooltipParagraph = styled(P)`
  font-family: var(--font-family);
  font-size: 0.875rem;
  margin: 0.5rem 0 -0.5rem;
`;

const PopupStopContent = styled(StopContent)`
  padding: 0 0 1rem;
  font-size: 1rem;
`;

const DepartureTimeGroup = styled.div`
  min-width: 300px;
`;

@inject(app("Time"))
@observer
class RouteStop extends React.Component {
  onClickTime = (time) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(time);
  };

  onShowStreetView = () => {
    const {onViewLocation, stop} = this.props;
    onViewLocation(latLng({lat: stop.lat, lng: stop.lng}));
  };

  render() {
    const {
      stop,
      departure,
      date,
      firstStop,
      firstTerminal,
      lastTerminal,
      selectedJourney,
      showRadius,
      selected,
      highlighted,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    let stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        <StopHeading>
          <strong>{get(stop, "name", "")}</strong> {get(stop, "stopId", "")} (
          {get(stop, "shortId", "").replace(/ /g, "")})
        </StopHeading>
      </Tooltip>
    );

    let stopStreetViewPopup = (
      <Popup
        minWidth={300}
        maxWidth={800}
        autoPan={true}
        key={`stop_${stop.stopId}_popup`}>
        <PopupStopContent>
          <StopHeading>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </PopupStopContent>
        <button onClick={this.onShowStreetView}>Show in street view</button>
      </Popup>
    );

    let markerChildren = [stopTooltip, stopStreetViewPopup];

    const mode = getPriorityMode(get(stop, "modes", []));
    let color = getModeColor(mode);

    if (
      !selectedJourney ||
      !departure ||
      !departure.observedDepartureTime ||
      !departure.observedArrivalTime
    ) {
      return (
        <RouteStopMarker
          key={`route_stop_marker_${stop.stopId}`}
          delayType="none"
          color={color}
          isTerminal={isTerminal}
          stop={stop}
          showRadius={showRadius}
          selected={selected}>
          {markerChildren}
        </RouteStopMarker>
      );
    }

    const firstDeparture = firstStop;

    const departureDiff = departure.observedDepartureTime.departureTimeDifference;
    const departureDelayType = getDelayType(departureDiff);
    const departureDiffTime = secondsToTimeObject(departureDiff);

    const arrivalDiff = departure.observedArrivalTime.arrivalTimeDifference;
    const arrivalDiffTime = secondsToTimeObject(arrivalDiff);

    color = getTimelinessColor(departureDelayType, "var(--light-green)");

    const stopArrivalTime = departure.observedArrivalTime.arrivalTime;
    const stopDepartureTime = departure.observedDepartureTime.departureTime;

    // Calculate the duration values

    let plannedDuration = 0;
    let observedDuration = 0;
    let durationDiff = 0;
    let durationDiffSign = "";

    const firstDeparturePlannedDepartureTime = get(
      firstDeparture,
      "plannedDepartureTime.departureTime",
      null
    );

    if (firstDeparturePlannedDepartureTime) {
      plannedDuration =
        timeToSeconds(departure.plannedDepartureTime.departureTime) -
        timeToSeconds(firstDeparture.plannedDepartureTime.departureTime);
    }

    const firstDepartureObservedTime = get(
      firstDeparture,
      "observedDepartureTime.departureTime",
      ""
    );

    const firstDepartureObservedSeconds = timeToSeconds(firstDepartureObservedTime);
    const stopDepartureSeconds = timeToSeconds(stopDepartureTime);

    if (firstDepartureObservedSeconds && stopDepartureSeconds) {
      observedDuration = stopDepartureSeconds - firstDepartureObservedSeconds;
    }

    if (plannedDuration > 0 && observedDuration > 0) {
      const durationDiffSeconds = observedDuration - plannedDuration;
      durationDiffSign = durationDiffSeconds < 0 ? "-" : "";
      durationDiff = secondsToTimeObject(durationDiffSeconds);
    }

    const observedDepartureTime = (
      <TagButton onClick={this.onClickTime(stopDepartureTime)}>
        <PlainSlot>
          {getNormalTime(departure.plannedDepartureTime.departureTime)}
        </PlainSlot>
        <ColoredBackgroundSlot
          color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
          backgroundColor={color}>
          {departureDiff < 0 ? "-" : ""}
          {departureDiffTime.hours ? doubleDigit(departureDiffTime.hours) + ":" : ""}
          {doubleDigit(get(departureDiffTime, "minutes", 0))}:
          {doubleDigit(get(departureDiffTime, "seconds", 0))}
        </ColoredBackgroundSlot>
        <PlainSlotSmall>{getNormalTime(stopDepartureTime)}</PlainSlotSmall>
      </TagButton>
    );

    let observedArrivalTime = null;

    if (firstTerminal) {
      observedArrivalTime = (
        <CalculateTerminalTime
          date={date}
          departure={departure}
          event={departure.observedArrivalTime.arrivalEvent}>
          {({offsetTime, wasLate, diffHours, diffMinutes, diffSeconds, sign}) => (
            <>
              <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
                <PlainSlot
                  style={{
                    fontStyle: "italic",
                    fontSize: "0.925rem",
                    lineHeight: "1.2rem",
                  }}>
                  {offsetTime.format("HH:mm:ss")}*
                </PlainSlot>
                <ColoredBackgroundSlot
                  color="white"
                  backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                  {sign === "-" ? "-" : ""}
                  {diffHours ? doubleDigit(diffHours) + ":" : ""}
                  {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
                </ColoredBackgroundSlot>
                <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
              </StopArrivalTime>
              <SmallText>
                * <Text>journey.departure_minus_terminal</Text>
              </SmallText>
            </>
          )}
        </CalculateTerminalTime>
      );
    } else if (lastTerminal) {
      observedArrivalTime = (
        <CalculateTerminalTime
          recovery={true}
          date={date}
          departure={departure}
          event={departure.observedArrivalTime.arrivalEvent}>
          {({offsetTime, wasLate, diffHours, diffMinutes, diffSeconds, sign}) => (
            <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
              <PlainSlot>{offsetTime.format("HH:mm:ss")}</PlainSlot>
              <ColoredBackgroundSlot
                color="white"
                backgroundColor={wasLate ? "var(--red)" : "var(--light-green)"}>
                {sign === "-" ? "-" : ""}
                {diffHours ? doubleDigit(diffHours) + ":" : ""}
                {doubleDigit(diffMinutes)}:{doubleDigit(diffSeconds)}
              </ColoredBackgroundSlot>
              <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
            </StopArrivalTime>
          )}
        </CalculateTerminalTime>
      );
    } else {
      observedArrivalTime = (
        <StopArrivalTime onClick={this.onClickTime(stopArrivalTime)}>
          <PlainSlot>{getNormalTime(departure.plannedArrivalTime.arrivalTime)}</PlainSlot>
          <ColoredBackgroundSlot
            color="var(--dark-grey)"
            backgroundColor="var(--lighter-grey)">
            {arrivalDiff < 0 ? "-" : ""}
            {arrivalDiffTime.hours ? doubleDigit(arrivalDiffTime.hours) + ":" : ""}
            {doubleDigit(get(arrivalDiffTime, "minutes", 0))}:
            {doubleDigit(get(arrivalDiffTime, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmall>{getNormalTime(stopArrivalTime)}</PlainSlotSmall>
        </StopArrivalTime>
      );
    }

    const doorDidOpen = departure.observedArrivalTime.doorDidOpen;

    const stopPopup = (
      <Popup
        maxHeight={750}
        maxWidth={500}
        autoPan={true}
        key={`stop${stop.stopId}_popup`}>
        <PopupStopContent>
          <StopHeading>
            <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
          </StopHeading>

          {(isTerminal || doorDidOpen) && departure.observedArrivalTime ? (
            <>
              <TimeHeading>
                <Text>journey.arrival</Text>
              </TimeHeading>
              {observedArrivalTime}
            </>
          ) : !doorDidOpen ? (
            <PopupParagraph>
              <Text>map.stops.doors_not_open</Text>
            </PopupParagraph>
          ) : null}

          {!lastTerminal && (
            <DepartureTimeGroup>
              <TimeHeading>
                <Text>journey.departure</Text>
              </TimeHeading>
              {observedDepartureTime}
            </DepartureTimeGroup>
          )}

          {plannedDuration > 0 && observedDuration > 0 && (
            <>
              <TimeHeading>
                <Text>journey.duration</Text>
              </TimeHeading>
              <TagButton>
                <PlainSlot>{secondsToTime(plannedDuration)}</PlainSlot>
                <ColoredBackgroundSlot
                  color="var(--dark-grey)"
                  backgroundColor="var(--lighter-grey)">
                  {durationDiffSign}
                  {durationDiff.hours ? doubleDigit(durationDiff.hours) + ":" : ""}
                  {doubleDigit(get(durationDiff, "minutes", 0))}:
                  {doubleDigit(get(durationDiff, "seconds", 0))}
                </ColoredBackgroundSlot>
                <PlainSlotSmall>{secondsToTime(observedDuration)}</PlainSlotSmall>
              </TagButton>
            </>
          )}
        </PopupStopContent>
        <button onClick={this.onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        <StopHeading>
          <strong>{stop.name}</strong> {stop.stopId} ({stop.shortId.replace(/ /g, "")})
        </StopHeading>
        {!doorDidOpen && (
          <TooltipParagraph>
            <Text>map.stops.doors_not_open</Text>
          </TooltipParagraph>
        )}
        {lastTerminal ? (
          <>
            <TimeHeading>
              <Text>journey.arrival</Text>
            </TimeHeading>
            {observedArrivalTime}
          </>
        ) : (
          <>
            <TimeHeading>
              <Text>journey.departure</Text>
            </TimeHeading>
            {observedDepartureTime}
          </>
        )}
      </Tooltip>
    );

    markerChildren = [stopTooltip, stopPopup];

    return (
      <RouteStopMarker
        key={`journey_stop_marker_${stop.stopId}`}
        doorDidOpen={doorDidOpen}
        delayType={departureDelayType}
        color={color}
        isTerminal={isTerminal}
        stop={stop}
        showRadius={showRadius}
        highlighted={highlighted}
        selected={selected}>
        {markerChildren}
      </RouteStopMarker>
    );
  }
}

export default RouteStop;
