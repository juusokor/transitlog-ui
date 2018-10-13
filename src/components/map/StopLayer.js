import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";
import StopTimetable from "./StopTimetable";
import {Text} from "../../helpers/text";
import {Heading} from "../Typography";
import styled from "styled-components";
import Modal from "styled-react-modal";

const stopsByBboxQuery = gql`
  query stopsByBboxQuery(
    $minLat: Float!
    $minLon: Float!
    $maxLat: Float!
    $maxLon: Float!
    $date: Date!
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        shortId
        nameFi
        lat
        lon
        routeSegmentsForDate(date: $date) {
          nodes {
            line {
              nodes {
                lineId
                dateBegin
                dateEnd
              }
            }
            routeId
            dateBegin
            dateEnd
            direction
          }
        }
      }
    }
  }
`;

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
    this.props.Filters.setRoute(route);
  };

  render() {
    const {selectedStop, bounds, state, dateBegin, dateEnd} = this.props;
    const {date} = state;

    return (
      <Query query={stopsByBboxQuery} variables={{...bounds, date}}>
        {({loading, data, error}) => {
          if (loading) return <Text>general.loading</Text>;
          if (error) return <Text>general.error</Text>;
          const stops = get(data, "stopsByBbox.nodes", []);
          return (
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
                    <Popup>
                      <Heading level={4}>
                        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} (
                        {stop.stopId})
                      </Heading>
                      <button onClick={() => this.setState({modalOpen: true})}>
                        open
                      </button>
                      <TimetableModal
                        isOpen={this.state.modalOpen}
                        onBackgroundClick={() => this.setState({modalOpen: false})}
                        onEscapeKeydown={() => this.setState({modalOpen: false})}>
                        <StopTimetable
                          date={date}
                          stopId={this.state.selectedStop}
                        />
                      </TimetableModal>
                      {stop.routeSegmentsForDate.nodes.map((route) => (
                        <StopRouteList
                          key={`route_${route.routeId}_${route.direction}`}
                          onClick={this.selectRoute(route)}>
                          {route.routeId.substring(1).replace(/^0+/, "")}
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
          );
        }}
      </Query>
    );
  }
}

export default StopLayer;
