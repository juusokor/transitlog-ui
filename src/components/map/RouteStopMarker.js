import timingStopIcon from "../../icon-time1.svg";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import React, {useCallback, useRef, useEffect} from "react";
import {StopRadius} from "./StopRadius";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {flow} from "lodash";
import DivIcon from "./DivIcon";
import {StopMarkerCircle as StopMarkerIcon, IconWrapper, MarkerIcons} from "./StopMarker";
import styled from "styled-components";

const decorate = flow(
  observer,
  inject("Filters")
);

const StopMarkerCircle = styled(StopMarkerIcon)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RouteStopMarker = decorate(
  ({
    stop,
    showRadius,
    selected,
    highlighted,
    color,
    isTerminal,
    children,
    doorDidOpen = true,
    Filters,
    noJourney = false,
  }) => {
    const markerRef = useRef(null);

    useEffect(() => {
      if (selected && markerRef.current) {
        markerRef.current.leafletElement.openPopup();
      } else if (markerRef.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [selected]);

    const onClickMarker = useCallback(() => {
      Filters.setStop(stop.stopId);
    }, [stop]);

    const mode = getPriorityMode(get(stop, "modes", []));
    const stopColor = getModeColor(mode);

    const markerPosition = [stop.lat, stop.lng];

    const markerElement = (
      <DivIcon
        ref={markerRef}
        pane={"stops"}
        position={markerPosition}
        onClick={onClickMarker}
        icon={
          <IconWrapper>
            <StopMarkerCircle
              color={color}
              big={isTerminal || selected || stop.isTimingStop}
              dashed={!doorDidOpen}
              fill={highlighted ? "var(--purple)" : selected ? stopColor : "white"}>
              {stop.isTimingStop && <img src={timingStopIcon} />}
            </StopMarkerCircle>
            {get(stop, "alerts", []).length !== 0 && (
              <MarkerIcons iconSize="0.875rem" objectWithAlerts={stop} />
            )}
          </IconWrapper>
        }
        key={`route_stop_marker_${stop.id}`}>
        {children}
      </DivIcon>
    );

    return showRadius ? (
      <StopRadius
        key={`${!noJourney ? "journey_" : ""}stop_radius_${stop.stopId}${
          selected ? "_selected" : ""
        }`}
        isHighlighted={selected}
        center={markerPosition}
        radius={stop.radius}
        color={stopColor}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );
  }
);

export default RouteStopMarker;
