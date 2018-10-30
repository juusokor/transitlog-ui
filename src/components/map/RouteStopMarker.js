import React from "react";
import {Marker, CircleMarker, Tooltip} from "react-leaflet";
import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer} from "mobx-react";
import {diffDepartureJourney} from "../../helpers/diffDepartureJourney";
import getDelayType from "../../helpers/getDelayType";
import doubleDigit from "../../helpers/doubleDigit";
import orderBy from "lodash/orderBy";

const stopColor = "var(--blue)";

@observer
class RouteStopMarker extends React.Component {
  createStopMarker = (
    stop,
    delayType,
    isSelected,
    isTerminal,
    onSelect,
    children = null
  ) => {
    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: `stop-marker timing-stop ${delayType}`,
    });

    const color =
      delayType === "early"
        ? "var(--red)"
        : delayType === "late"
          ? "var(--yellow)"
          : delayType === "on-time"
            ? "var(--light-green)"
            : stopColor;

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
      <React.Fragment>
        <Tooltip>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Tooltip>
        {children}
      </React.Fragment>
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

    // Show a marker without the popup if we don't have any data
    if (departures.length === 0 || positions.length === 0 || !selectedJourney) {
      return this.createStopMarker(stop, stopColor, selected, isTerminal, onSelect);
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
      return this.createStopMarker(stop, stopColor, selected, isTerminal, onSelect);
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
      return this.createStopMarker(stop, stopColor, selected, isTerminal, onSelect);
    }

    let delayType = "on-time";

    if (departureHfpItem) {
      const plannedObservedDiff = diffDepartureJourney(
        departureHfpItem,
        departure,
        date
      );

      delayType = getDelayType(plannedObservedDiff.diff);
    }

    return this.createStopMarker(stop, delayType, selected, isTerminal, onSelect);
  }
}

export default RouteStopMarker;
