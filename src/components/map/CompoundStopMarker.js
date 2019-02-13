import React, {Component, useRef, useEffect, useCallback} from "react";
import {observer} from "mobx-react-lite";
import {Popup, Marker} from "react-leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import compact from "lodash/compact";
import uniq from "lodash/uniq";
import styled, {createGlobalStyle} from "styled-components";
import {StopRadius} from "./StopRadius";
import {divIcon, latLng} from "leaflet";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {observable, action} from "mobx";
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

const ChooseStopHeading = styled(Heading).attrs({level: 4})`
  margin-top: 0;
  margin-bottom: 0.5rem;
`;

const MarkerIconStyle = createGlobalStyle`
  .compoundIconWrapper {
    border-radius: 50%;
    background: transparent;
    border: 0;
  }

  .compoundMarkerIcon {
    border-radius: 50%;
    background: white;
    border: 3px solid transparent;
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    line-height: 1.1;
    color: var(--grey);
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
`;

const decorate = flow(
  observer,
  inject("Filters")
);

const CompoundStopMarker = decorate(
  ({
    popupOpen,
    stops,
    state,
    showRadius = true,
    bounds,
    onViewLocation,
    Filters,
  }) => {
    const didAutoOpen = useRef(false);
    const markerRef = useRef(null);

    useEffect(() => {
      if (popupOpen && markerRef.current) {
        markerRef.current.leafletElement.openPopup();
        didAutoOpen.current = true;
      } else if (didAutoOpen.current) {
        markerRef.current.leafletElement.closePopup();
      }
    }, [popupOpen]);

    const selectRoute = (route) => () => {
      if (route) {
        Filters.setRoute(route);
      }
    };

    const selectStop = useCallback((stopId) => {
      if (stopId) {
        Filters.setStop(stopId);
      }
    }, []);

    const {stop: selectedStop} = state;

    const selectedStopObj =
      selectedStop && stops.length !== 0
        ? stops.find((stop) => stop.stopId === selectedStop)
        : null;

    const modesInCluster = uniq(
      compact(
        stops.map((stop) => getPriorityMode(get(stop, "modes.nodes", ["BUS"])))
      )
    );

    let mode =
      modesInCluster.length === 0
        ? "BUS"
        : modesInCluster.length === 1
        ? modesInCluster[0]
        : getPriorityMode(modesInCluster);

    let stopColor = getModeColor(mode);

    if (selectedStopObj) {
      mode = getPriorityMode(get(selectedStopObj, "modes.nodes", ["BUS"]));
      stopColor = getModeColor(mode);
    }

    const markerPosition = selectedStopObj
      ? latLng(selectedStopObj.lat, selectedStopObj.lon)
      : bounds.getCenter();

    const markerIcon = divIcon({
      className: "compoundIconWrapper",
      html: `<span
data-testid="compound-marker-icon"
class="compoundMarkerIcon"
style="border-color: ${stopColor}; background-color: ${
        selectedStopObj ? stopColor : "white"
      }; color: ${selectedStopObj ? "white" : stopColor}">
  ${stops.length}
</span>`,
      iconSize: 27.5,
    });

    const markerElement = (
      <Marker
        ref={markerRef}
        icon={markerIcon}
        pane="stops"
        position={markerPosition}>
        <Popup
          autoClose={false}
          autoPan={false}
          keepInView={false}
          onClose={() => (didAutoOpen.current = false)}
          minWidth={300}
          maxHeight={750}
          maxWidth={550}>
          <ChooseStopHeading>Select stop:</ChooseStopHeading>
          {stops.map((stopInGroup) => {
            const mode = getPriorityMode(get(stopInGroup, "modes.nodes", []));
            const stopColor = getModeColor(mode);

            return (
              <StopOptionButton
                color={stopColor}
                onClick={() => selectStop(stopInGroup.stopId)}
                key={`stop_select_${stopInGroup.stopId}`}>
                {stopInGroup.stopId} - {stopInGroup.nameFi}
              </StopOptionButton>
            );
          })}
          {selectedStopObj && (
            <>
              <Heading level={4}>
                {selectedStopObj.nameFi}, {selectedStopObj.shortId.replace(/ /g, "")}{" "}
                ({selectedStopObj.stopId})
              </Heading>
              {get(selectedStopObj, "routeSegmentsForDate.nodes", []).map(
                (routeSegment) => (
                  <StopOptionButton
                    color={stopColor}
                    key={`route_${routeSegment.routeId}_${routeSegment.direction}`}
                    onClick={selectRoute(get(routeSegment, "route.nodes[0]", null))}>
                    {routeSegment.routeId.substring(1).replace(/^0+/, "")}
                  </StopOptionButton>
                )
              )}
            </>
          )}
          <button onClick={() => onViewLocation(markerPosition)}>
            Show in street view
          </button>
        </Popup>
      </Marker>
    );

    const stopMarkerElement =
      showRadius && selectedStopObj ? (
        <StopRadius
          // The "pane" prop on the Circle element is not dynamic, so the
          // StopRadius component should be remounted when selected or
          // deselected for the circle to appear on the correct layer.
          key={`stop_radius_${selectedStopObj.stopId}_selected`}
          isHighlighted={true}
          center={markerPosition}
          color={stopColor}
          radius={selectedStopObj.stopRadius}>
          {markerElement}
        </StopRadius>
      ) : (
        markerElement
      );

    return (
      <>
        <MarkerIconStyle color={stopColor} />
        {stopMarkerElement}
      </>
    );
  }
);

export default CompoundStopMarker;
