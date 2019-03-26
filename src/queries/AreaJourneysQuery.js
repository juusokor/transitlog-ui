import React, {useEffect, useRef, useCallback, useMemo} from "react";
import {Query} from "react-apollo";
import get from "lodash/get";
import gql from "graphql-tag";
import {setUpdateListener, removeUpdateListener} from "../stores/UpdateManager";
import {getServerClient} from "../api";
import {observer} from "mobx-react-lite";

const areaJourneysQuery = gql`
  query areaJourneysQuery($minTime: DateTime!, $maxTime: DateTime!, $bbox: PreciseBBox!) {
    eventsByBbox(minTime: $minTime, maxTime: $maxTime, bbox: $bbox) {
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

const updateListenerName = "area hfp query";

const client = getServerClient();

const AreaJourneysQuery = observer((props) => {
  const {minTime, maxTime, bbox, skip, children} = props;
  const prevResults = useRef([]);
  const refetcher = useRef(null);

  const queryVars = useMemo(
    () => ({
      minTime: minTime,
      maxTime: maxTime,
      bbox,
    }),
    [minTime, maxTime, bbox]
  );

  const queryParamsValid = queryVars.minTime && queryVars.maxTime && queryVars.bbox;
  const shouldSkip = skip || !queryParamsValid;

  const createRefetcher = (refetch) => () => {
    if (!shouldSkip) {
      refetch(queryVars);
    }
  };

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  if (shouldSkip) {
    prevResults.current = [];
  }

  return (
    <Query
      client={client}
      skip={shouldSkip}
      variables={queryVars}
      query={areaJourneysQuery}>
      {({loading, data, error, refetch, variables, ...rest}) => {
        if (!data || loading) {
          return children({journeys: prevResults.current, loading, error, ...rest});
        }

        const journeys = get(data, "eventsByBbox", []);

        prevResults.current = journeys;
        refetcher.current = refetch;

        setUpdateListener(updateListenerName, createRefetcher(refetch));
        return children({journeys, loading, error, ...rest});
      }}
    </Query>
  );
});

export default AreaJourneysQuery;
