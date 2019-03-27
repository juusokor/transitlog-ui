import React, {useRef} from "react";
import {Query} from "react-apollo";
import get from "lodash/get";
import gql from "graphql-tag";
import {observer} from "mobx-react-lite";

const areaJourneysQuery = gql`
  query areaJourneysQuery(
    $minTime: DateTime!
    $maxTime: DateTime!
    $bbox: PreciseBBox!
    $date: Date!
  ) {
    eventsByBbox(minTime: $minTime, maxTime: $maxTime, bbox: $bbox, date: $date) {
      id
      routeId
      direction
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      headsign
      mode
      events {
        id
        receivedAt
        recordedAt
        recordedAtUnix
        recordedTime
        nextStopId
        lat
        lng
        doorStatus
        velocity
        delay
        heading
      }
    }
  }
`;

const AreaJourneysQuery = observer((props) => {
  const {minTime, maxTime, bbox, date, skip, children} = props;

  const prevResults = useRef([]);

  const queryParamsValid = minTime && maxTime && bbox && date;
  const shouldSkip = skip || !queryParamsValid;

  if (shouldSkip) {
    prevResults.current = [];
  }

  return (
    <Query
      skip={shouldSkip}
      variables={{
        minTime,
        maxTime,
        bbox,
        date,
      }}
      notifyOnNetworkStatusChange={true}
      query={areaJourneysQuery}>
      {({loading, data, error}) => {
        if (!data || loading) {
          return children({journeys: prevResults.current, loading, error});
        }

        const journeys = get(data, "eventsByBbox", []);
        prevResults.current = journeys;

        return children({journeys, loading, error});
      }}
    </Query>
  );
});

export default AreaJourneysQuery;
