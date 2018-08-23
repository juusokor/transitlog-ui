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
  ) {
    stopsByBbox(minLat: $minLat, minLon: $minLon, maxLat: $maxLat, maxLon: $maxLon) {
      nodes {
        stopId
        lat
        lon
        routeSegmentsForDate(date: "2018-08-08") {
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
const selectedStopColor = "#33ff88";

@inject(app("Filters"))
@withRoute
@observer
class StopLayer extends Component {
  constructor(props) {
    super(props);
    this.state = {selectedStop: null};
  }

  selectRoute = (route) => (e) => {
    const getRouteValue = (route) =>
      `${route.routeId}/${route.direction}/${route.dateBegin}/${route.dateEnd}`;
    const {Filters} = this.props;
    const selectedValue = getRouteValue(route);
    console.log("foo", selectedValue);
    if (!selectedValue) {
      return Filters.setRoute({});
    }

    const [routeId, direction, dateBegin, dateEnd] = selectedValue.split("/");
    Filters.setRoute({routeId, direction, dateBegin, dateEnd});
    console.log(routeId);
  };

  render() {
    const {selectedStop, bounds} = this.props;

    return (
      <Query query={stopsByBboxQuery} variables={bounds}>
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
                  fillColor={"white"}
                  fillOpacity={1}
                  radius={selectedStop === stop.stopId ? 10 : 8}
                  onPopupopen={() => this.setState({selectedStop: stop.stopId})}
                  onPopupclose={() => this.setState({selectedStop: null})}>
                  {this.state.selectedStop === stop.stopId ? (
                    <Popup>
                      {stop.routeSegmentsForDate.nodes.map((route) => (
                        <button
                          key={`route_${route.routeId}`}
                          onClick={this.selectRoute(route)}>
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
