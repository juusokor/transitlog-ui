import React from "react";
import {Marker, CircleMarker, Tooltip, Popup} from "react-leaflet";
import {icon, latLng} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer, inject} from "mobx-react";
import {Heading, P} from "../Typography";
import {ColoredBackgroundSlot} from "../TagButton";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import {StopRadius} from "./StopRadius";
import {journeyEventTime, getNormalTime} from "../../helpers/time";
import {Text} from "../../helpers/text";
import {app} from "mobx-app";

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

@inject(app("Filters"))
@observer
class RouteStopMarker extends React.Component {
  onClickMarker = () => {
    const {stop, Filters} = this.props;
    Filters.setStop(stop.stopId);
  };

  createStopMarker = (delayType, color, isTerminal, children) => {
    const {stop, showRadius, selected} = this.props;

    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: `stop-marker timing-stop ${delayType}`,
    });

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    const markerPosition = [stop.lat, stop.lon];

    const markerElement = React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: markerPosition, // One marker type uses center...
        position: markerPosition, // ...the other uses position.
        color: color,
        fillColor: selected ? stopColor : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal || selected ? 12 : 8,
        onClick: this.onClickMarker,
      },
      children
    );

    return showRadius ? (
      <StopRadius
        key={`stop_radius_${stop.stopId}${selected ? "_selected" : ""}`}
        isHighlighted={selected}
        center={markerPosition}
        radius={stop.stopRadius}
        color={stopColor}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );
  };

  onShowStreetView = () => {
    const {onViewLocation, stop} = this.props;
    onViewLocation(latLng({lat: stop.lat, lng: stop.lon}));
  };

  render() {
    const {stop, firstTerminal, lastTerminal, selectedJourney} = this.props;

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
        autoPan={true}
        key={`stop_${stop.stopId}_popup`}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        <button onClick={this.onShowStreetView}>Show in street view</button>
      </Popup>
    );

    let markerChildren = [stopTooltip, stopStreetViewPopup];

    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);

    let color = stopColor;
    let delayType = "none";

    if (!selectedJourney || !stop.departure || !stop.departureEvent) {
      return this.createStopMarker(delayType, color, isTerminal, markerChildren);
    }

    const {
      departureEvent,
      plannedDepartureMoment,
      departureMoment,
      departureDelayType,
      departureDiff,
      plannedArrivalMoment,
      arrivalMoment,
      departureColor,
      arrivalEvent,
      doorDidOpen,
    } = stop;

    delayType = departureDelayType;
    color = departureColor;

    const stopDepartureTime = journeyEventTime(departureEvent);
    const stopArrivalTime = journeyEventTime(arrivalEvent);

    const observedTime = (
      <ObservedTime
        backgroundColor={color}
        color={delayType === "late" ? "var(--dark-grey)" : "white"}>
        {getNormalTime(stopDepartureTime)}
      </ObservedTime>
    );

    const stopPopup = (
      <Popup
        maxHeight={750}
        maxWidth={550}
        autoPan={true}
        key={`stop${stop.stopId}_popup`}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        {doorDidOpen ? (
          <PopupParagraph>
            <Text>map.stops.arrive</Text>:{" "}
            <PlannedTime>{getNormalTime(stopArrivalTime)}</PlannedTime>
          </PopupParagraph>
        ) : (
          <PopupParagraph>
            <Text>map.stops.doors_not_open</Text>
          </PopupParagraph>
        )}
        <PopupParagraph>
          <Text>map.stops.planned_driveby</Text>:{" "}
          <PlannedTime>{plannedDepartureMoment.format("HH:mm:ss")}</PlannedTime>
        </PopupParagraph>
        <PopupParagraph>
          <Text>map.stops.observed_driveby</Text>: {observedTime}
        </PopupParagraph>
        <button onClick={this.onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})<br />
        {observedTime}
      </Tooltip>
    );

    markerChildren = [stopTooltip, stopPopup];

    return this.createStopMarker(delayType, color, isTerminal, markerChildren);
  }
}

export default RouteStopMarker;
