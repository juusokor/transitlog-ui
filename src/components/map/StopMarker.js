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
import timingStopIcon from "../../icon-time1.svg";

const decorate = flow(
  observer,
  inject("Filters")
);

export const StopMarkerCircle = styled.div`
  width: ${({big = false}) => (big ? "2.2rem" : "1.25rem")};
  height: ${({big = false}) => (big ? "2.2rem" : "1.25rem")};
  border-radius: 50%;
  border: ${({thickBorder = false}) => (thickBorder ? "4px" : "3px")}
    ${({dashed = false}) => (dashed ? "dashed" : "solid")}
    ${({isSelected = false, color = "var(--blue)"}) =>
      isSelected ? "var(--light-blue)" : color};
  background-color: ${({isHighlighted, isSelected, color = "var(--blue)"}) =>
    isHighlighted ? "var(--purple)" : isSelected ? color : "white"};
  align-items: center;
  justify-content: center;
  color: ${({color = "var(--blue)"}) => color};
  font-weight: bold;
  display: flex;
  font-size: 0.95rem;
  line-height: 1.1;
  background-clip: ${({isSelected = false}) =>
    isSelected ? "content-box" : "border-box"};
  padding: ${({isSelected = false}) => (isSelected ? "2px" : "0")};

  img {
    width: 100%;
    height: 100%;
  }
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
  ({
    popupOpen,
    stop,
    position = null,
    mode = "BUS",
    selected,
    color,
    dashedBorder = false,
    state,
    showRadius = true,
    isTerminal = false,
    isTimingStop = false,
    highlighted,
    onViewLocation,
    Filters,
    alerts = [],
    children,
    iconChildren,
    markerRef: ref,
  }) => {
    const didAutoOpen = useRef(false);
    const defaultRef = useRef(null);
    const markerRef = ref || defaultRef;

    useEffect(() => {
      if (ref) {
        return;
      }

      if (popupOpen && markerRef.current) {
        markerRef.current.leafletElement.openPopup();
        didAutoOpen.current = true;
      } else if (didAutoOpen.current && markerRef.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [ref, popupOpen]);

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

    const {lat, lng} = stop || position || {};

    const onShowStreetView = useCallback(() => {
      onViewLocation(latLng({lat, lng}));
    }, [onViewLocation, stop]);

    if (!stop && !position) {
      return null;
    }

    const {stop: selectedStop} = state;

    const isSelected = selected || (stop && selectedStop === stop.stopId);
    const stopIsTimingStop = isTimingStop || !!stop.isTimingStop;
    const stopMode = !stop ? mode : getPriorityMode(get(stop, "modes", []));
    const stopColor = color ? color : getModeColor(stopMode);

    const popupElement = children ? (
      children
    ) : stop ? (
      <MapPopup onClose={() => (didAutoOpen.current = false)}>
        <StopPopupContent
          stop={stop}
          color={stopColor}
          onSelectRoute={selectRoute}
          onShowStreetView={onShowStreetView}
        />
      </MapPopup>
    ) : null;

    const markerPosition = latLng({lat, lng});

    const markerElement = (
      <DivIcon
        ref={markerRef}
        pane="stops"
        position={markerPosition}
        icon={
          <IconWrapper>
            <StopMarkerCircle
              thickBorder={isTerminal}
              isSelected={isSelected}
              isHighlighted={highlighted}
              dashed={dashedBorder}
              big={!!(iconChildren || isSelected || isTerminal || stopIsTimingStop)}
              color={stopColor}>
              {stopIsTimingStop ? (
                <img alt="Timing stop" src={timingStopIcon} />
              ) : (
                iconChildren
              )}
            </StopMarkerCircle>
            {get(stop, "alerts", alerts).length !== 0 && (
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
