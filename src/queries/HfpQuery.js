import {getClient} from "../api";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import getJourneyId from "../helpers/getJourneyId";
import {combineDateAndTime} from "../helpers/time";

const client = getClient();

function createCompositeJourney(date, route, time) {
  if (!route || !route.routeId || !date || !time) {
    return false;
  }

  const journey = {
    oday: date,
    journey_start_time: time,
    journey_start_timestamp: combineDateAndTime(date, time, "Europe/Helsinki"),
    route_id: route.routeId,
    direction_id: route.direction,
  };

  return journey;
}

export const hfpQuery = gql`
  query hfpQuery($route_id: String, $direction: smallint, $date: date, $time: time) {
    vehicles(
      order_by: {received_at: asc}
      where: {
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        oday: {_eq: $date}
        journey_start_time: {_eq: $time}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

export const queryHfp = (route, date, time) => {
  const {routeId, direction} = route;
  const fetchedJourneyId = getJourneyId(createCompositeJourney(date, route, time));

  return client
    .query({
      query: hfpQuery,
      variables: {
        route_id: routeId,
        direction: parseInt(direction, 10),
        date,
        time,
      },
    })
    .then(({data}) => ({data: get(data, "vehicles", []), fetchedJourneyId}));
};
