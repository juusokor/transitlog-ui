import {hfpClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import subHours from "date-fns/sub_hours";
import addHours from "date-fns/add_hours";
import format from "date-fns/format";

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

export const queryHfp = (route, date, time) => {
  const {routeId, direction} = route;

  const queryDateTime = new Date(`${date}T${time}`);
  const timeMin = subHours(queryDateTime, 1);
  const timeMax = addHours(queryDateTime, 1);

  return hfpClient
    .query({
      fetchPolicy: "cache-first",
      query: hfpQuery,
      variables: {
        route_id: routeId,
        direction: parseInt(direction, 10),
        date,
        time_min: format(timeMin, "HH:mm:ss"),
        time_max: format(timeMax, "HH:mm:ss"),
      },
    })
    .then(({data}) => get(data, "vehicles", []));
};
