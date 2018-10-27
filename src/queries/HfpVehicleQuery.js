import React from "react";
import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";

export const hfpQuery = gql`
  query hfpQuery(
    $route_id: String!
    $direction: smallint!
    $date: date!
    $vehicle_id: String!
  ) {
    vehicles(
      order_by: received_at_asc
      where: {
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        oday: {_eq: $date}
        unique_vehicle_id: {_eq: $vehicle_id}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const queryHfpByVehicle = (route, date, vehicleId) => {
  const {routeId, direction} = route;

  return hfpClient
    .query({
      query: hfpQuery,
      variables: {
        route_id: routeId,
        direction: parseInt(direction, 10),
        date,
        vehicle_id: vehicleId,
      },
    })
    .then(({data}) => get(data, "vehicles", []));
};
