import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, CircleMarker} from "react-leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import styled from "styled-components";
import {app} from "mobx-app";
import {StopRadius} from "./StopRadius";
import {boundsFromBBoxString} from "../../helpers/boundsFromBBoxString";
import {getPriorityMode, getModeColor} from "../../helpers/vehicleColor";

const StopOptionButton = styled.button`
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  background: #e6e6e6;
  margin: 0 0 3px 3px;
  display: inline-block;
  border: ${({color = ""}) => (color ? `3px solid ${color}` : "0")};
  cursor: pointer;
`;

@inject(app("Filters"))
@observer
class CompoundStopMarker extends Component {
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
    const {
      stops,
      state,
      showRadius = true,
      bboxString = "",
      onViewLocation,
    } = this.props;
    const {stop: selectedStop} = state;

    const areaBounds = boundsFromBBoxString(bboxString);

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

    const markerPosition = areaBounds.getCenter();

    const markerElement = (
      <CircleMarker
        pane="stops"
        center={markerPosition}
        color={stopColor}
        fillColor="white"
        fillOpacity={1}
        radius={10}>
        {stops.length}
        <Popup
          autoPan={false}
          autoClose={false}
          keepInView={false}
          minWidth={300}
          maxHeight={750}
          maxWidth={550}>
          {!selectedStopObj ? (
            <>
              <h5>Select stop:</h5>
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
            </>
          ) : (
            <>
              <Heading level={4}>
                {selectedStopObj.nameFi}, {selectedStopObj.shortId.replace(/ /g, "")}{" "}
                ({selectedStopObj.stopId})
              </Heading>
              {get(selectedStopObj, "routeSegmentsForDate.nodes", []).map(
                (routeSegment) => (
                  <StopOptionButton
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
      </CircleMarker>
    );

    return showRadius && selectedStopObj ? (
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
  }
}

export default CompoundStopMarker;
