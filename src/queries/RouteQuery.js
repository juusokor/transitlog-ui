import React, {Component} from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import distanceBetween from "../helpers/distanceBetween";
import {Query} from "react-apollo";
import gql from "graphql-tag";

const routeQuery = gql`
  query routeQuery(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      geometries {
        nodes {
          geometry
        }
      }
      routeSegments {
        nodes {
          stop: stopByStopId {
            stopId
            lat
            lon
            shortId
            nameFi
            nameSe
          }
        }
      }
    }
  }
`;

class RouteQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.string,
      dateBegin: PropTypes.string,
      dateEnd: PropTypes.string,
    }).isRequired,
    hfpPositions: PropTypes.arrayOf(
      PropTypes.shape({
        lat: PropTypes.number,
        long: PropTypes.number,
      })
    ),
    children: PropTypes.func.isRequired,
  };

  render() {
    const {route, hfpPositions = [], children} = this.props;
    const {routeId, direction, dateBegin, dateEnd} = route;

    return (
      <Query
        query={routeQuery}
        fetchPolicy="cache-and-network"
        variables={{
          routeId,
          direction,
          dateBegin,
          dateEnd,
        }}>
        {({loading, error, data}) => {
          const positions = get(
            data,
            "route.geometries.nodes[0].geometry.coordinates",
            []
          );

          const firstHfp = hfpPositions[0];

          const stops = get(data, "route.routeSegments.nodes", []);

          const hfpStops = stops.reduce((stops, {stop}) => {
            const {lat: stopLat, lon: stopLng} = stop;
            let hfp = {};

            if (firstHfp) {
              const initialClosest = {
                hfp: firstHfp,
                distanceFromStop: distanceBetween(
                  stopLat,
                  stopLng,
                  firstHfp.lat,
                  firstHfp.long
                ),
              };

              hfp = hfpPositions.reduce((closest, pos) => {
                if (closest.distanceFromStop < 0.005) {
                  return closest;
                }

                const {lat: posLat, long: posLng} = pos;

                const distanceFromStop = distanceBetween(
                  stopLat,
                  stopLng,
                  posLat,
                  posLng
                );

                return distanceFromStop < closest.distanceFromStop
                  ? {
                      distanceFromStop,
                      hfp: pos,
                    }
                  : closest;
              }, initialClosest);
            }

            const hfpStop = {
              ...stop,
              ...hfp,
            };

            stops.push(hfpStop);
            return stops;
          }, []);

          return children({routePositions: positions, stops: hfpStops});
        }}
      </Query>
    );
  }
}

export default RouteQuery;
