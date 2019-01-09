import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";

const vehiclesQuery = gql`
  query vehiclesQuery($date: date) {
    vehicles(
      distinct_on: unique_vehicle_id
      order_by: {unique_vehicle_id: asc}
      where: {oday: {_eq: $date}}
    ) {
      unique_vehicle_id
      vehicle_number
      owner_operator_id
    }
  }
`;

export default ({children, date}) => (
  <Query query={vehiclesQuery} variables={{date}}>
    {({loading, error, data}) => {
      if (loading || !data) {
        return children({loading, error, vehicles: []});
      }

      const vehicles = get(data, "vehicles", []);

      return children({
        loading,
        error,
        vehicles,
      });
    }}
  </Query>
);
