import React, {useCallback, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import {Popup, CircleMarker} from "react-leaflet";
import {latLng} from "leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {Text} from "../../helpers/text";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 0.25rem 0.5rem;
  border-radius: 5px;
  background: var(--lightest-grey);
  margin: 0 0 0.5rem 0;
  display: block;
  border: ${({color = "var(--lightest-grey)"}) =>
    color ? `3px solid ${color}` : "3px solid var(--lightest-grey)"};
  cursor: pointer;

  &:hover {
    background-color: var(--lighter-grey);
  }
`;

function cleanRouteId(routeId) {
  return routeId.substring(1).replace(/^0+/, "");
}

const decorate = flow(
  observer,
  inject("Filters")
);

const StopMarker = decorate(
  ({popupOpen, stop, state, showRadius = true, onViewLocation, Filters}) => {
    const didAutoOpen = useRef(false);
    const markerRef = useRef(null);

    useEffect(() => {
      if (popupOpen && markerRef.current) {
        markerRef.current.leafletElement.openPopup();
        didAutoOpen.current = true;
      } else if (didAutoOpen.current && markerRef.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [popupOpen]);

    const selectRoute = (route) => () => {
      if (route) {
        Filters.setRoute(route);
      }
    };

    const selectStop = useCallback(() => {
      if (stop) {
        Filters.setStop(stop.stopId);
      }
    }, [stop]);

    const onShowStreetView = useCallback(() => {
      onViewLocation(latLng({lat: stop.lat, lng: stop.lon}));
    }, [onViewLocation, stop]);

    const {stop: selectedStop} = state;

    const isSelected = selectedStop === stop.stopId;
    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);
    const {stopRadius} = stop;

    const popupElement = (
      <Popup
        autoPan={false}
        autoClose={false}
        keepInView={false}
        onClose={() => (didAutoOpen.current = false)}
        minWidth={300}
        maxHeight={750}
        maxWidth={550}>
        <Heading level={4}>
          {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        {get(stop, "routeSegmentsForDate.nodes", []).map((routeSegment) => (
          <StopOptionButton
            color={stopColor}
            key={`route_${cleanRouteId(routeSegment.routeId)}_${
              routeSegment.direction
            }_${routeSegment.dateBegin}_${routeSegment.dateEnd}`}
            onClick={selectRoute(get(routeSegment, "route.nodes[0]", null))}>
            {cleanRouteId(routeSegment.routeId)}
          </StopOptionButton>
        ))}
        <button onClick={onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    const markerPosition = latLng(stop.lat, stop.lon);

    const markerElement = (
      <CircleMarker
        ref={markerRef}
        pane="stops"
        center={markerPosition}
        color={stopColor}
        fillColor={isSelected ? stopColor : "white"}
        fillOpacity={1}
        onClick={selectStop}
        radius={isSelected ? 12 : 8}>
        {popupElement}
      </CircleMarker>
    );

    const stopMarkerElement = showRadius ? (
      <StopRadius
        // The "pane" prop on the Circle element is not dynamic, so the
        // StopRadius component should be remounted when selected or
        // deselected for the circle to appear on the correct layer.
        key={`stop_radius_${stop.stopId}${isSelected ? "_selected" : ""}`}
        isHighlighted={isSelected}
        center={markerPosition}
        color={stopColor}
        radius={stopRadius}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );

    return stopMarkerElement;
  }
);

export default StopMarker;
