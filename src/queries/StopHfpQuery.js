import React, {Component} from "react";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {createHfpItem} from "../helpers/hfpQueryManager";

const stopDelayQuery = gql`
  query stopDelay(
    $routes: [String]!
    $date: date!
    $directions: [smallint]!
    $stopId: String!
  ) {
    vehicles(
      where: {
        route_id: {_in: $routes}
        dir: {_in: $directions}
        oday: {_eq: $date}
        next_stop_id: {_eq: $stopId}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

@observer
class StopHfpQuery extends Component {
  render() {
    const {
      onCompleted = () => {},
      routes,
      date,
      directions,
      stopId,
      skip,
      children,
    } = this.props;

    return (
      <Query
        skip={skip}
        onCompleted={onCompleted}
        client={hfpClient}
        variables={{routes, date, directions, stopId}}
        query={stopDelayQuery}>
        {({loading, data}) => {
          const journeys = get(data, "vehicles", []).map(createHfpItem);
          return children({journeys});
        }}
      </Query>
    );
  }
}

export default StopHfpQuery;
