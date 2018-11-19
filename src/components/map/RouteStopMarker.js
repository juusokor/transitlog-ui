import React from "react";
import {Marker, CircleMarker, Tooltip, Popup} from "react-leaflet";
import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer} from "mobx-react";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import doubleDigit from "../../helpers/doubleDigit";
import orderBy from "lodash/orderBy";
import {Heading, P} from "../Typography";
import {ColoredBackgroundSlot, PlainSlot} from "../TagButton";
import styled from "styled-components";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import moment from "moment-timezone";
import StopStreetView from "./StopStreetView";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";

const PopupParagraph = styled(P)`
  font-size: 1rem;
`;

const PlannedTime = styled.span`
  font-size: 1rem;
  font-weight: bold;
`;

const ObservedTime = styled(ColoredBackgroundSlot)`
  font-size: 0.875rem;
`;

@observer
class RouteStopMarker extends React.Component {
  createStopMarker = (
    stop,
    delayType,
    color,
    isSelected,
    isTerminal,
    onSelect,
    children
  ) => {
    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: `stop-marker timing-stop ${delayType}`,
    });

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    return React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: [stop.lat, stop.lon], // One marker type uses center...
        position: [stop.lat, stop.lon], // ...the other uses position.
        color: color,
        fillColor: isSelected ? stopColor : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal ? 12 : isSelected ? 10 : 8,
        onClick: onSelect,
      },
      <React.Fragment>{children}</React.Fragment>
    );
  };

  render() {
    const {
      stop,
      routeOriginStopId,
      selected,
      firstTerminal,
      lastTerminal,
      departures = [],
      positions = [],
      date,
      onSelect,
      selectedJourney,
    } = this.props;

    const isTerminal = firstTerminal || lastTerminal;

    let stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
      </Tooltip>
    );

    let stopStreetViewPopup = (
      <Popup
        minWidth={300}
        maxWidth={800}
        autoPan={false}
        key={`stop_${stop.stopId}_popup`}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        <StopStreetView stop={stop} />
      </Popup>
    );

    let markerChildren = [stopTooltip, stopStreetViewPopup];

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    let color = stopColor;
    let delayType = "none";

    // Show a marker without the popup if we don't have any data
    if (departures.length === 0 || positions.length === 0 || !selectedJourney) {
      return this.createStopMarker(
        stop,
        delayType,
        color,
        selected,
        isTerminal,
        onSelect,
        markerChildren
      );
    }

    const {journey_start_time} = selectedJourney;
    let departure;

    // Find the departure from the first stop.
    const firstDeparture = departures.find(
      (departure) =>
        `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}:00` ===
          journey_start_time && departure.stopId === routeOriginStopId
    );

    if (firstTerminal && firstDeparture) {
      // The first stop is easy. Select the departure
      // found above as the stop departure.
      departure = firstDeparture;
    } else if (firstDeparture) {
      // For other stops, find a departure from this stop from
      // the same departure chain as the first departure.
      departure = departures.find(
        (dep) =>
          dep.departureId === firstDeparture.departureId &&
          dep.stopId === stop.stopId
      );
    }

    // If we don't have a departure, no biggie, just render the stop marker at this point.
    if (!departure) {
      return this.createStopMarker(
        stop,
        delayType,
        color,
        selected,
        isTerminal,
        onSelect,
        markerChildren
      );
    }

    const stopPositions = orderBy(
      positions.filter(
        (pos) =>
          pos.journey_start_time === journey_start_time &&
          pos.next_stop_id === stop.stopId
      ),
      "received_at_unix",
      "desc"
    );

    // Find the hfp item that matches this departure.
    // Sort by received_at descending and select the first element, this way we get the
    // hfp item that represents the time when the vehicle left the stop, ie the
    // last hfp item before the next_stop_id value changed.
    let departureHfpItem = stopPositions[0];

    // Again, render the marker at this point if we didn't find an hfp item.
    if (!departureHfpItem) {
      return this.createStopMarker(
        stop,
        delayType,
        color,
        selected,
        isTerminal,
        onSelect,
        markerChildren
      );
    }

    // Find out when the vehicle arrived at the stop
    // by looking at when the doors were opened.
    let doorDidOpen = false;
    let arrivalHfpItem = departureHfpItem;

    for (const positionIndex in stopPositions) {
      const position = stopPositions[positionIndex];

      if (doorDidOpen && !position.drst) {
        arrivalHfpItem = stopPositions[positionIndex - 1];
        break;
      }

      if (!doorDidOpen && !!position.drst) {
        doorDidOpen = true;
      }
    }

    // Get the difference between the planned and the observed time,
    // now that we have both.
    const {observedMoment, plannedMoment, diff} = diffDepartureJourney(
      departureHfpItem,
      departure,
      date
    );

    delayType = getDelayType(diff);

    color = getTimelinessColor(delayType, stopColor);

    if (observedMoment) {
      const observedTime = (
        <ObservedTime backgroundColor={color} color="white">
          {observedMoment.format("HH:mm:ss")}
        </ObservedTime>
      );

      let arrivalMoment;

      if (doorDidOpen) {
        arrivalMoment = moment.tz(arrivalHfpItem.received_at, "Europe/Helsinki");
      }

      const stopPopup = (
        <Popup
          minWidth={300}
          maxWidth={750}
          autoPan={false}
          key={`stop${stop.stopId}_popup`}>
          <Heading level={4}>
            {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
          </Heading>
          {doorDidOpen ? (
            <PopupParagraph>
              Arrival time:{" "}
              <PlannedTime>{arrivalMoment.format("HH:mm:ss")}</PlannedTime>
            </PopupParagraph>
          ) : (
            <PopupParagraph>The doors did not open at this stop.</PopupParagraph>
          )}
          <PopupParagraph>
            Planned drive by time:{" "}
            <PlannedTime>{plannedMoment.format("HH:mm:ss")}</PlannedTime>
          </PopupParagraph>
          <PopupParagraph>Observed drive by time: {observedTime}</PopupParagraph>
          <StopStreetView stop={stop} />
        </Popup>
      );

      stopTooltip = (
        <Tooltip key={`stop${stop.stopId}_tooltip`}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})<br />
          {observedTime}
        </Tooltip>
      );

      markerChildren = [stopTooltip, stopPopup];
    }

    return this.createStopMarker(
      stop,
      delayType,
      color,
      selected,
      isTerminal,
      onSelect,
      markerChildren
    );
  }
}

export default RouteStopMarker;
