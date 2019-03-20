import {icon} from "leaflet";
import TimingStopIcon from "../../icon-time1.svg";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import get from "lodash/get";
import React, {useCallback, useRef, useEffect} from "react";
import {Marker, CircleMarker} from "react-leaflet";
import {StopRadius} from "./StopRadius";
import {observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import {flow} from "lodash";

const decorate = flow(
  observer,
  inject("Filters")
);

const RouteStopMarker = decorate(
  ({
    stop,
    showRadius,
    selected,
    highlighted,
    delayType,
    color,
    isTerminal,
    children,
    doorDidOpen = true,
    Filters,
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

    const timingStopIcon = icon({
      iconUrl: TimingStopIcon,
      iconSize: [30, 30],
      iconAnchor: [23, 25 / 2],
      popupAnchor: [3, -15],
      className: `stop-marker timing-stop ${delayType} ${
        !doorDidOpen ? "doors-not-opened" : ""
      }`,
    });

    const mode = getPriorityMode(get(stop, "modes", []));
    const stopColor = getModeColor(mode);

    const markerPosition = [stop.lat, stop.lng];

    const markerElement = React.createElement(
      stop.timingStopType ? Marker : CircleMarker,
      {
        key: `route_stop_marker_${stop.stopId}_${stop.stopIndex}_${doorDidOpen}_${color}`,
        ref: markerRef,
        pane: "stops",
        icon: stop.timingStopType ? timingStopIcon : null,
        center: markerPosition, // One marker type uses center...
        position: markerPosition, // ...the other uses position.
        color: color,
        dashArray: !doorDidOpen ? "3 5" : "",
        fillColor: highlighted ? "var(--purple)" : selected ? stopColor : "white",
        fillOpacity: 1,
        strokeWeight: isTerminal ? 5 : 3,
        radius: isTerminal || selected ? 13 : 9,
        onClick: onClickMarker,
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
  }
);

export default RouteStopMarker;
