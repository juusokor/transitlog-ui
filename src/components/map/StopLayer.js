import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../hoc/withRoute";

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

const departuresByStopQuery = gql`
query stopDepartures($stopId: String!, $routeId: String!, $dayType: String!, $dateBegin: Date!, $dateEnd: Date!) {
    allDepartures(
      condition: {
        stopId: $stopId
        dayType: $dayType
        dateBegin: $dateBegin
        dateEnd: $dateEnd
      }
      orderBy: DEPARTURE_ID_ASC
    ) {
      nodes {
        stopId
        routeId
        departureId
        hours
        minutes
        dateBegin
        dateEnd
        dayType
      }
    }
  }`;

const stopColor = "#3388ff";

@inject(app("Filters"))
@withRoute
@observer
class StopLayer extends Component {
  state = {selectedStop: null};
  selectRoute = (route) => (e) => {
    this.props.Filters.setRoute(route);
  };

  render() {
    const {selectedStop, bounds, state, dateBegin, dateEnd} = this.props;
    const {date} = state;

    return (
      <Query query={stopsByBboxQuery} variables={{...bounds, date}}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const stops = get(data, "stopsByBbox.nodes", []);
          console.log(this.state)
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
                    <Query query={departuresByStopQuery} variables={{...stop}}>
                    {({loading, data, error}) => {
                      if (loading) return "Loading...";
                      if (error) return "Error!";
                      const time = get(data, "allDepartures.nodes", []);
                      console.log(this.state)
                      return (
                      
                      <React.Fragment>
                      <h4>
                        {stop.nameFi}, {stop.shortId.replace(/ /g, "")} (
                        {stop.stopId})
                      </h4>
                        {stop.routeSegmentsForDate.nodes.map((route) => (
                          <button
                            key={`route_${route.routeId}_${route.direction}`}
                            className={"stop-route-list"}
                            onClick={this.selectRoute(route)}>
                            {route.routeId.substring(1).replace(/^0+/, "")}
                          </button>
                        ))}
                      </React.Fragment>
                      )}}
                      </Query>
                    </Popup>
                  ) : (
                    <Popup>Loading..</Popup>
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
