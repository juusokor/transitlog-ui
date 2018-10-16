import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, CircleMarker} from "react-leaflet";
import {Heading} from "../Typography";
import get from "lodash/get";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import {app} from "mobx-app";

const stopColor = "var(--blue)";

const StopRouteList = styled.button`
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  background: #e6e6e6;
  margin: 0 0 3px 3px;
  display: inline-block;
  border: 1px solid transparent;
  cursor: pointer;
`;

@inject(app("Filters"))
@observer
class StopMarker extends Component {
  selectRoute = (route) => (e) => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  render() {
    const {stop, selected, onSelectStop = () => {}} = this.props;

    return (
      <CircleMarker
        pane="stops"
        center={[stop.lat, stop.lon]}
        color={stopColor}
        fillColor={selected ? stopColor : "white"}
        fillOpacity={1}
        onClick={onSelectStop(stop)}
        radius={selected ? 10 : 8}>
        <Popup autoPan={false} autoClose={false} keepInView={false} maxHeight={500}>
          <Heading level={4}>
            {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
          </Heading>
          {get(stop, "routeSegmentsForDate.nodes", []).map((routeSegment) => (
            <StopRouteList
              key={`route_${routeSegment.routeId}_${routeSegment.direction}`}
              onClick={this.selectRoute(get(routeSegment, "route.nodes[0]", null))}>
              {routeSegment.routeId.substring(1).replace(/^0+/, "")}
            </StopRouteList>
          ))}
        </Popup>
      </CircleMarker>
    );
  }
}

export default StopMarker;
