import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {Popup, CircleMarker} from "react-leaflet";
import {Heading} from "../Typography";
import StopTimetable from "./StopTimetable";
import get from "lodash/get";
import {Text} from "../../helpers/text";
import styled from "styled-components";
import Modal from "styled-react-modal";
import {app} from "mobx-app";

const stopColor = "var(--blue)";

const StopRouteList = styled.button`
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 3px;
  background: #e6e6e6;
  margin: 0 0 3px 3px;
  display: inline-block;
  border: 0;
  cursor: pointer;
`;

const TimetableModal = Modal.styled`
  width: auto;
  margin: 10em;
  height: auto;
  background-color: white;
  border: 2px solid black;
  border-radius: 5px;
  
`;

@inject(app("Filters"))
@observer
class StopMarker extends Component {
  state = {
    modalOpen: false,
  };

  selectRoute = (route) => () => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  selectStop = () => {
    const {stop, Filters} = this.props;

    if (stop) {
      Filters.setStop(stop.nodeId);
    }
  };

  render() {
    const {stop, state} = this.props;
    const {stop: selectedStop, date} = state;

    const selected = selectedStop === stop.nodeId;

    return (
      <CircleMarker
        pane="stops"
        center={[stop.lat, stop.lon]}
        color={stopColor}
        fillColor={selected ? stopColor : "white"}
        fillOpacity={1}
        radius={selected ? 10 : 8}
        onClick={this.selectStop}>
        <Popup autoPan={false} autoClose={false} keepInView={false} maxHeight={500}>
          <Heading level={4}>
            {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
          </Heading>
          <button onClick={() => this.setState({modalOpen: true})}>open</button>
          <TimetableModal
            isOpen={this.state.modalOpen}
            onBackgroundClick={() => this.setState({modalOpen: false})}
            onEscapeKeydown={() => this.setState({modalOpen: false})}>
            <StopTimetable date={date} stopId={stop.stopId} />
          </TimetableModal>
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
