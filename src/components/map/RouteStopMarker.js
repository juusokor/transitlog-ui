import React from "react";
import {Marker, CircleMarker, Tooltip, Popup} from "react-leaflet";
import {icon, latLng} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {observer, inject} from "mobx-react";
import {Heading, P} from "../Typography";
import {
  ColoredBackgroundSlot,
  PlainSlot,
  PlainSlotSmall,
  TagButton,
} from "../TagButton";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import {StopRadius} from "./StopRadius";
import {journeyEventTime, getNormalTime} from "../../helpers/time";
import {Text} from "../../helpers/text";
import {app} from "mobx-app";
import {getTimelinessColor} from "../../helpers/timelinessColor";
import doubleDigit from "../../helpers/doubleDigit";
import {TimeHeading, StopHeading, StopContent} from "../StopElements";

const PopupParagraph = styled(P)`
  font-size: 1rem;
`;

const PopupStopContent = styled(StopContent)`
  padding: 0 0 1rem;
  font-size: 1rem;
`;

const PlannedTime = styled.span`
  font-size: 1rem;
  font-weight: bold;
`;

const DepartureTimeGroup = styled.div`
  min-width: 300px;
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
        <StopHeading>
          <strong>{stop.nameFi}</strong> {stop.stopId} (
          {stop.shortId.replace(/ /g, "")})
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
            <strong>{stop.nameFi}</strong> {stop.stopId} (
            {stop.shortId.replace(/ /g, "")})
          </StopHeading>
        </PopupStopContent>
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
      <DepartureTimeGroup>
        <TimeHeading>
          <Text>journey.departure</Text>
        </TimeHeading>
        <TagButton>
          <PlainSlot>{plannedDepartureMoment.format("HH:mm:ss")}</PlainSlot>
          <ColoredBackgroundSlot
            color={departureDelayType === "late" ? "var(--dark-grey)" : "white"}
            backgroundColor={getTimelinessColor(
              departureDelayType,
              "var(--light-green)"
            )}>
            {departureDiff.sign}
            {doubleDigit(get(departureDiff, "minutes", 0))}:
            {doubleDigit(get(departureDiff, "seconds", 0))}
          </ColoredBackgroundSlot>
          <PlainSlotSmall>{getNormalTime(stopDepartureTime)}</PlainSlotSmall>
        </TagButton>
      </DepartureTimeGroup>
    );

    const stopPopup = (
      <Popup
        maxHeight={750}
        maxWidth={550}
        autoPan={true}
        key={`stop${stop.stopId}_popup`}>
        <PopupStopContent>
          <StopHeading>
            <strong>{stop.nameFi}</strong> {stop.stopId} (
            {stop.shortId.replace(/ /g, "")})
          </StopHeading>
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
          {observedTime}
        </PopupStopContent>
        <button onClick={this.onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    stopTooltip = (
      <Tooltip key={`stop${stop.stopId}_tooltip`}>
        <StopHeading>
          <strong>{stop.nameFi}</strong> {stop.stopId} (
          {stop.shortId.replace(/ /g, "")})
        </StopHeading>
        {observedTime}
      </Tooltip>
    );

    markerChildren = [stopTooltip, stopPopup];

    return this.createStopMarker(delayType, color, isTerminal, markerChildren);
  }
}

export default RouteStopMarker;
