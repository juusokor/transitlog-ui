import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, Marker} from "react-leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled, {createGlobalStyle} from "styled-components";
import {app} from "mobx-app";
import {StopRadius} from "./StopRadius";
import {divIcon, latLng} from "leaflet";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";
import {observable, action} from "mobx";

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
  .compoundMarkerIcon {
    border-radius: 50%;
    background: white;
    border: 3px solid ${({color = "var(--blue)"}) => color};
    display: flex !important;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--grey);
    font-weight: bold;
  }
`;

@inject(app("Filters"))
@observer
class CompoundStopMarker extends Component {
  @observable
  popupOpen = false;

  togglePopupOpen = action((setTo = !this.popupOpen) => {
    this.popupOpen = setTo;
  });

  selectRoute = (route) => () => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  selectStop = (stopId) => {
    const {Filters} = this.props;

    if (stopId) {
      Filters.setStop(stopId);
    }
  };

  render() {
    const {stops, state, showRadius = true, bounds, onViewLocation} = this.props;
    const {stop: selectedStop} = state;

    const selectedStopObj =
      selectedStop && stops.length !== 0
        ? stops.find((stop) => stop.stopId === selectedStop)
        : null;

    let mode = "BUS",
      stopColor = "var(--blue)";

    if (selectedStopObj) {
      mode = getPriorityMode(get(selectedStopObj, "modes.nodes", []));
      stopColor = getModeColor(mode);
    }

    const markerPosition = selectedStopObj
      ? latLng(selectedStopObj.lat, selectedStopObj.lon)
      : bounds.getCenter();

    const markerIcon = divIcon({
      className: "compoundMarkerIcon",
      html: stops.length,
      iconSize: 30,
    });

    const markerElement = (
      <Marker
        onClick={() => this.togglePopupOpen()}
        icon={markerIcon}
        pane="stops"
        position={markerPosition}
      />
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

    const popupElement = (
      <Popup
        position={markerPosition}
        autoClose={false}
        autoPan={false}
        keepInView={false}
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
              onClick={() => this.selectStop(stopInGroup.stopId)}
              key={`stop_select_${stopInGroup.stopId}`}>
              {stopInGroup.stopId} - {stopInGroup.nameFi}
            </StopOptionButton>
          );
        })}
        {selectedStopObj && (
          <>
            <Heading level={4}>
              {selectedStopObj.nameFi}, {selectedStopObj.shortId.replace(/ /g, "")} (
              {selectedStopObj.stopId})
            </Heading>
            {get(selectedStopObj, "routeSegmentsForDate.nodes", []).map(
              (routeSegment) => (
                <StopOptionButton
                  color={stopColor}
                  key={`route_${routeSegment.routeId}_${routeSegment.direction}`}
                  onClick={this.selectRoute(
                    get(routeSegment, "route.nodes[0]", null)
                  )}>
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
    );

    return (
      <>
        <MarkerIconStyle color={stopColor} />
        {stopMarkerElement}
        {this.popupOpen && popupElement}
      </>
    );
  }
}

export default CompoundStopMarker;
