import React, {Component} from "react";
import {hfpClient} from "../api";
import get from "lodash/get";
import {Query} from "react-apollo";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import withRoute from "../hoc/withRoute";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

export const hfpQuery = gql`
  query hfpQuery($route_id: String, $direction: smallint, $date: date) {
    vehicles(
      limit: 100
      order_by: received_at_asc
      where: {
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        oday: {_eq: $date}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const fetchHfpQuery = ({route, date}) => {
  const {routeId, direction} = route;

  return hfpClient
    .query({
      fetchPolicy: "cache-first",
      query: hfpQuery,
      variables: {
        route_id: routeId,
        direction: parseInt(direction, 10),
        date,
      },
    })
    .then(({data}) => get(data, "allVehicles.nodes", []));
};

@inject(app("Filters"))
@withRoute
@observer
class HfpQuery extends Component {
  static propTypes = {
    route: PropTypes.shape({
      routeId: PropTypes.string,
      direction: PropTypes.string,
      dateBegin: PropTypes.string,
      dateEnd: PropTypes.string,
    }).isRequired,
    stopId: PropTypes.string,
    date: PropTypes.string,
    children: PropTypes.func.isRequired,
  };

  render() {
    const {route, children, date} = this.props;
    const {routeId, direction} = route;

    return (
      <Query
        client={hfpClient}
        query={hfpQuery}
        fetchPolicy="cache-first"
        variables={{
          route_id: routeId,
          direction: parseInt(direction, 10),
          date,
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
