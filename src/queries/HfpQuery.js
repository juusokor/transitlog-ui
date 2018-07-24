import React, {Component} from "react";
import {hfpClient} from "../api";
import get from "lodash/get";
import moment from "moment";
import {Query} from "react-apollo";
import PropTypes from "prop-types";
import gql from "graphql-tag";

const hfpQuery = gql`
  query hfpQuery($routeId: String, $direction: Int, $date: Date) {
    allVehicles(
      orderBy: RECEIVED_AT_ASC
      condition: {routeId: $routeId, directionId: $direction, oday: $date}
    ) {
      nodes {
        journeyStartTime
        nextStopId
        receivedAt
        lat
        long
        uniqueVehicleId
        spd
        __typename
      }
    }
  }
`;

class HfpQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.string,
      dateBegin: PropTypes.string,
      dateEnd: PropTypes.string,
    }).isRequired,
    stopId: PropTypes.string,
    queryDate: PropTypes.string,
    children: PropTypes.func.isRequired,
  };

  render() {
    const {route, children, queryDate} = this.props;
    const {routeId, direction} = route;

    return (
      <Query
        client={hfpClient}
        query={hfpQuery}
        fetchPolicy="cache-first"
        variables={{
          routeId,
          direction: parseInt(direction),
          date: queryDate,
        }}>
        {({loading, error, data}) => {
          let hfpPositions = get(data, "allVehicles.nodes", []);
          return children({hfpPositions, loading, error});
        }}
      </Query>
    );
  }
}

export default HfpQuery;
