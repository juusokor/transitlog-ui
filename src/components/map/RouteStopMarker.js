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

const stopColor = "var(--blue)";

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
        stopTooltip
      );
    }

    const {journey_start_time} = selectedJourney;

    let departure;

    const firstDeparture = departures.find(
      (departure) =>
        `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}:00` ===
          journey_start_time && departure.stopId === routeOriginStopId
    );

    if (firstTerminal && firstDeparture) {
      // The first stop is easy. Just find the departure
      // that matches the journey_start_time.
      departure = firstDeparture;
    } else if (firstDeparture) {
      departure = departures.find(
        (dep) =>
          dep.departureId === firstDeparture.departureId &&
          dep.stopId === stop.stopId
      );
    }

    if (!departure) {
      return this.createStopMarker(
        stop,
        delayType,
        color,
        selected,
        isTerminal,
        onSelect,
        stopTooltip
      );
    }

    let departureHfpItem = orderBy(
      positions.filter(
        (pos) =>
          pos.journey_start_time === journey_start_time &&
          pos.next_stop_id === stop.stopId
      ),
      "received_at_unix",
      "desc"
    )[0];

    if (!departureHfpItem) {
      return this.createStopMarker(
        stop,
        delayType,
        color,
        selected,
        isTerminal,
        onSelect,
        stopTooltip
      );
    }

    delayType = "on-time";
    let driveByTime = false;
    let plannedTime = false;

    if (departureHfpItem) {
      const plannedObservedDiff = diffDepartureJourney(
        departureHfpItem,
        departure,
        date
      );

      driveByTime = plannedObservedDiff.observedMoment;
      plannedTime = plannedObservedDiff.plannedMoment;
      delayType = getDelayType(plannedObservedDiff.diff);
    }

    color = getTimelinessColor(delayType, stopColor);
    let markerChildren = [stopTooltip];

    if (driveByTime) {
      const observedTime = (
        <ObservedTime backgroundColor={color} color="white">
          {driveByTime.format("HH:mm:ss")}
        </ObservedTime>
      );

      const stopPopup = (
        <Popup
          minWidth={300}
          maxWidth={500}
          autoPan={false}
          key={`stop${stop.stopId}_popup`}>
          <Heading level={4}>
            {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
          </Heading>
          <PopupParagraph>
            Planned drive by time:{" "}
            <PlannedTime>{plannedTime.format("HH:mm:ss")}</PlannedTime>
          </PopupParagraph>
          <PopupParagraph>Observed drive by time: {observedTime}</PopupParagraph>
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
