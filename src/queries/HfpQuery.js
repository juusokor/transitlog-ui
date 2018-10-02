import React, {Component} from "react";
import PropTypes from "prop-types";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import subMinutes from "date-fns/sub_minutes";
import addMinutes from "date-fns/add_minutes";
import format from "date-fns/format";
import {observer} from "mobx-react";
import withRoute from "../hoc/withRoute";
import {Query} from "react-apollo";

export const hfpQuery = gql`
  query hfpQuery(
    $route_id: String
    $direction: smallint
    $date: date
    $time_min: time
    $time_max: time
  ) {
    vehicles(
      order_by: received_at_asc
      where: {
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        oday: {_eq: $date}
        journey_start_time: {_gte: $time_min, _lte: $time_max}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const queryHfp = (route, date, timeRange) => {
  const {routeId, direction} = route;
  const {min, max} = timeRange;

  return hfpClient
    .query({
      fetchPolicy: "cache-first",
      query: hfpQuery,
      variables: {
        route_id: routeId,
        direction: parseInt(direction, 10),
        date,
        time_min: format(min, "HH:mm:ss"),
        time_max: format(max, "HH:mm:ss"),
      },
    })
    .then(({data}) => get(data, "vehicles", []));
};

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
    date: PropTypes.string,
    time: PropTypes.string,
    children: PropTypes.func.isRequired,
  };

  render() {
    const {route, children, date, time} = this.props;
    const {routeId, direction} = route;

    const queryDateTime = new Date(`${date}T${time}`);
    const timeMin = subMinutes(queryDateTime, 5);
    const timeMax = addMinutes(queryDateTime, 5);

    return (
      <Query
        client={hfpClient}
        query={hfpQuery}
        fetchPolicy="cache-first"
        variables={{
          route_id: routeId,
          direction: parseInt(direction, 10),
          date,
          time_min: format(timeMin, "HH:mm:ss"),
          time_max: format(timeMax, "HH:mm:ss"),
        }}>
        {({loading, error, data}) => {
          let hfpPositions = get(data, "vehicles", []);
          return children({hfpPositions, loading, error});
        }}
      </Query>
    );
  }
}

export default HfpQuery;
