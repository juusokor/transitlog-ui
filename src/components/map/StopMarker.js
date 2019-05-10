import React, {useCallback, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {latLng} from "leaflet";
import get from "lodash/get";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import StopPopupContent from "./StopPopupContent";
import MapPopup from "./MapPopup";
import DivIcon from "./DivIcon";
import AlertIcons from "../AlertIcons";

const decorate = flow(
  observer,
  inject("Filters")
);

export const StopMarkerCircle = styled.div`
  width: ${({big = false}) => (big ? "1.25rem" : "1rem")};
  height: ${({big = false}) => (big ? "1.25rem" : "1rem")};
  border-radius: 50%;
  border: 3px ${({dashed = false}) => (dashed ? "dashed" : "solid")}
    ${({color = "var(--blue)"}) => color};
  background-color: ${({fill = "white"}) => fill};
`;

export const IconWrapper = styled.div`
  position: relative;
  transform: translate(-50%, -50%);
`;

export const MarkerIcons = styled(AlertIcons)`
  display: flex;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 100%);
`;

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

    const selectRoute = useCallback(
      (route) => () => {
        if (route) {
          Filters.setRoute(route);
        }
      },
      []
    );

    const selectStop = useCallback(() => {
      if (stop) {
        Filters.setStop(stop.stopId);
      }
    }, [stop]);

    const {lat, lng} = stop;

    const onShowStreetView = useCallback(() => {
      onViewLocation(latLng({lat, lng}));
    }, [onViewLocation, stop]);

    const {stop: selectedStop} = state;

    const isSelected = selectedStop === stop.stopId;
    const mode = getPriorityMode(get(stop, "modes", []));
    const stopColor = getModeColor(mode);

    const popupElement = (
      <MapPopup onClose={() => (didAutoOpen.current = false)}>
        <StopPopupContent
          stop={stop}
          color={stopColor}
          onSelectRoute={selectRoute}
          onShowStreetView={onShowStreetView}
        />
      </MapPopup>
    );

    const markerPosition = latLng({lat, lng});

    const markerElement = (
      <DivIcon
        ref={markerRef}
        pane="stops"
        position={markerPosition}
        icon={
          <IconWrapper>
            <StopMarkerCircle big={isSelected} color={stopColor} />
            {get(stop, "alerts", []).length !== 0 && (
              <MarkerIcons iconSize="0.875rem" objectWithAlerts={stop} />
            )}
          </IconWrapper>
        }
        onClick={selectStop}>
        {popupElement}
      </DivIcon>
    );

    return showRadius ? (
      <StopRadius
        // The "pane" prop on the Circle element is not dynamic, so the
        // StopRadius component should be remounted when selected or
        // deselected for the circle to appear on the correct layer.
        key={`stop_radius_${stop.stopId}${isSelected ? "_selected" : ""}`}
        isHighlighted={isSelected}
        center={markerPosition}
        color={stopColor}
        radius={stop.radius}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );
  }
);

export default StopMarker;
