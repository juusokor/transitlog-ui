import React, {useCallback, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import {Popup, CircleMarker} from "react-leaflet";
import {latLng} from "leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {StopRadius} from "./StopRadius";
import {Text} from "../../helpers/text";
import {flow} from "lodash";
import {inject} from "../../helpers/inject";
import StopRouteSelect from "./StopRouteSelect";

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
      <Popup
        autoPan={false}
        autoClose={false}
        keepInView={false}
        onClose={() => (didAutoOpen.current = false)}
        minWidth={300}
        maxHeight={750}
        maxWidth={550}>
        <Heading level={4}>
          {stop.name}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
        </Heading>
        <StopRouteSelect
          color={stopColor}
          onSelectRoute={selectRoute}
          stopId={stop.stopId}
          date={state.date}
        />
        <button onClick={onShowStreetView}>
          <Text>map.stops.show_in_streetview</Text>
        </button>
      </Popup>
    );

    const markerPosition = latLng({lat, lng});

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
        radius={stop.radius}>
        {markerElement}
      </StopRadius>
    ) : (
      markerElement
    );

    return stopMarkerElement;
  }
);

export default StopMarker;
