import React from "react";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer} from "mobx-react";
import {Query} from "react-apollo";

export const hfpQuery = gql`
  query vehicleHfpQuery($date: date!, $vehicle_id: String!) {
    vehicles(
      order_by: received_at_asc
      where: {oday: {_eq: $date}, unique_vehicle_id: {_eq: $vehicle_id}}
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const HfpVehicleQuery = observer(({date, vehicleId, children}) => {
  return (
    <Query
      query={hfpQuery}
      client={hfpClient}
      variables={{
        date,
        vehicle_id: vehicleId,
      }}>
      {({data, loading}) => {
        const vehicles = get(data, "vehicles", []);
        return children({positions: vehicles, loading});
      }}
    </Query>
  );
});
