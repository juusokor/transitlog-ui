import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";
import StopTimetable from "./StopTimetable";
import {Text} from "../../helpers/text";
import {Heading} from "../Typography";
import styled from "styled-components";
import Modal from "styled-react-modal";
import get from "lodash/get";
import StopsByBboxQuery from "../../queries/StopsByBboxQuery";

const stopColor = "#3388ff";

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

const TimetableModal = Modal.styled`
  width: auto;
  margin: 10em;
  height: auto;
  background-color: white;
  border: 2px solid black;
  border-radius: 5px;
  
`;

@inject(app("Filters"))
@withRoute
@observer
class StopLayer extends Component {
  state = {selectedStop: null, modalOpen: false};

  selectRoute = (route) => (e) => {
    if (route) {
      this.props.Filters.setRoute(route);
    }
  };

  render() {
    const {selectedStop, bounds, state} = this.props;
    const {date} = state;

    return (
      <StopsByBboxQuery variables={{...bounds, date}}>
        {({stops}) => (
          <React.Fragment>
            {stops.map((stop) => (
              <CircleMarker
                key={`stops_${stop.stopId}`}
                pane="stops"
                center={[stop.lat, stop.lon]}
                color={stopColor}
                fillColor={"white"}
                fillOpacity={1}
                radius={selectedStop === stop.stopId ? 10 : 8}
                onPopupopen={() => this.setState({selectedStop: stop.stopId})}
                onPopupclose={() => this.setState({selectedStop: null})}>
                {this.state.selectedStop === stop.stopId ? (
                  <Popup
                    autoPan={false}
                    autoClose={false}
                    keepInView={false}
                    maxHeight={500}>
                    <Heading level={4}>
                      {stop.nameFi}, {stop.shortId.replace(/ /g, "")} ({stop.stopId})
                    </Heading>
                    <button onClick={() => this.setState({modalOpen: true})}>
                      open
                    </button>
                    <TimetableModal
                      isOpen={this.state.modalOpen}
                      onBackgroundClick={() => this.setState({modalOpen: false})}
                      onEscapeKeydown={() => this.setState({modalOpen: false})}>
                      <StopTimetable date={date} stopId={this.state.selectedStop} />
                    </TimetableModal>
                    {stop.routeSegmentsForDate.nodes.map((routeSegment) => (
                      <StopRouteList
                        key={`route_${routeSegment.routeId}_${
                          routeSegment.direction
                        }`}
                        onClick={this.selectRoute(
                          get(routeSegment, "route.nodes[0]", null)
                        )}>
                        {routeSegment.routeId.substring(1).replace(/^0+/, "")}
                      </StopRouteList>
                    ))}
                  </Popup>
                ) : (
                  <Popup>
                    <Text>general.loading</Text>
                  </Popup>
                )}
              </CircleMarker>
            ))}
          </React.Fragment>
        )}
      </StopsByBboxQuery>
    );
  }
}

export default StopLayer;
