import React, {useCallback, useEffect} from "react";
import {observer} from "mobx-react-lite";
import {Popup, CircleMarker} from "react-leaflet";
import {latLng} from "leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled from "styled-components";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {reaction} from "mobx";
import {Text} from "../../helpers/text";
import {useToggle} from "../../hooks/useToggle";
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
  ({stop, state, showRadius = true, onViewLocation, Filters}) => {
    const selectRoute = (route) => () => {
      if (route) {
        Filters.setRoute(route);
      }
    };

    const selectStop = useCallback(() => {
      this.togglePopup();

      if (stop) {
        Filters.setStop(stop.stopId);
      }
    }, [stop]);

    const onShowStreetView = useCallback(() => {
      onViewLocation(latLng({lat: stop.lat, lng: stop.lon}));
    }, [onViewLocation, stop]);

    const [popupOpen, togglePopup] = useToggle(false);

    useEffect(() => {
      let wasPreviouslyOpened = false;

      return reaction(
        () => state.stop,
        (stateStop) => {
          if (stateStop && stateStop === stop.stopId) {
            togglePopup(true);
            wasPreviouslyOpened = true;
          } else if (wasPreviouslyOpened) {
            togglePopup(false);
            wasPreviouslyOpened = false;
          }
        },
        {fireImmediately: true}
      );
    }, [stop]);

    const {stop: selectedStop} = state;

    const isSelected = selectedStop === stop.stopId;
    const mode = getPriorityMode(get(stop, "modes.nodes", []));
    const stopColor = getModeColor(mode);
    const {stopRadius} = stop;

    const markerPosition = latLng(stop.lat, stop.lon);

    const markerElement = (
      <CircleMarker
        pane="stops"
        center={markerPosition}
        color={stopColor}
        fillColor={isSelected ? stopColor : "white"}
        fillOpacity={1}
        onClick={selectStop}
        radius={isSelected ? 12 : 8}
      />
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

    const popupElement = (
      <Popup
        position={markerPosition}
        autoPan={false}
        autoClose={false}
        keepInView={false}
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

    return (
      <>
        {stopMarkerElement}
        {popupOpen && popupElement}
      </>
    );
  }
);

export default StopMarker;
