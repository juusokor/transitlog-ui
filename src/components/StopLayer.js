import React, {Component} from "react";
import {CircleMarker, Popup} from "react-leaflet";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";

const allStopsQuery = gql`
  query allStopsQuery {
    allStops(first: 50) {
      nodes {
        stopId
        shortId
        lat
        lon
        nameFi
      }
    }
  }
`;

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
      }
    }
  }
`;

const stopColor = "#3388ff";

class StopLayer extends Component {
  render() {
    return (
      <Query query={stopsByBboxQuery} variables={this.props.bounds}>
        {({loading, data, error}) => {
          if (loading) return "Loading...";
          if (error) return "Error!";
          const stops = get(data, "stopsByBbox.nodes", []);
          return (
            <React.Fragment>
              {stops.map((stop) => (
                <CircleMarker
                  key={`stops_${stop.stopId}`}
                  pane="stops"
                  center={[stop.lat, stop.lon]}
                  color={stopColor}
                  fillColor={stopColor}
                  fillOpacity={1}
                  radius={6}>
                  <Popup>Timetable of the day</Popup>
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
