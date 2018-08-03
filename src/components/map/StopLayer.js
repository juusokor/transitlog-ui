import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";

const stopsByBboxQuery = gql`
  query stopsByBboxQuery(
    $minLat: Float!
    $minLon: Float!
    $maxLat: Float!
    $maxLon: Float!
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        lat
        lon
        routeSegmentsForDate(date: "2018-05-06") {
          nodes {
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

class StopLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedStop: null};
  }

  render() {
    return (
      <Query query={stopsByBboxQuery} variables={this.props.bounds}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const stops = get(data, "stopsByBbox.nodes", []);
          console.log(stops);
          return (
            <React.Fragment>
              {stops.map((stop) => (
                <CircleMarker
                  key={`stops_${stop.stopId}`}
                  pane="stops"
                  center={[stop.lat, stop.lon]}
                  color={stopColor}
                  fillColor={"#FFF"}
                  fillOpacity={1}
                  radius={6}
                  onPopupopen={() => this.setState({selectedStop: stop.stopId})}
                  onPopupclose={() => this.setState({selectedStop: null})}>
                  {this.state.selectedStop === stop.stopId ? (
                    <Popup>
                      {stop.routeSegmentsForDate.nodes.map((route) => (
                        <button key={`route_${route.routeId}`}>
                          {route.routeId.substring(1).replace(/^0+/, "")}
                        </button>
                      ))}
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
