import React, {useEffect, useCallback} from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import {observer} from "mobx-react-lite";
import {Query} from "react-apollo";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";

export const hfpQuery = gql`
  query vehicleJourneysQuery($date: Date!, $uniqueVehicleId: VehicleId!) {
    vehicleJourneys(date: $date, uniqueVehicleId: $uniqueVehicleId) {
      id
      lineId
      routeId
      direction
      originStopId
      departureDate
      departureTime
      uniqueVehicleId
      operatorId
      vehicleId
      headsign
      mode
      receivedAt
      recordedAt
      recordedAtUnix
      recordedTime
      timeDifference
      nextStopId
    }
  }
`;

const updateListenerName = "vehicle hfp query";

const VehicleJourneysQuery = observer((props) => {
  const {date, vehicleId, skip, children} = props;
  let [operatorId, vehicleNumber] = vehicleId.split("/");

  operatorId = parseInt(operatorId, 10);
  vehicleNumber = parseInt(vehicleNumber, 10);

  const uniqueVehicleId = `${operatorId}/${vehicleNumber}`;

  const createRefetcher = useCallback(
    (refetch) => () => {
      if (vehicleId && !skip) {
        refetch({
          date,
          uniqueVehicleId,
        });
      }
    },
    [date, vehicleId, skip]
  );

  useEffect(() => () => removeUpdateListener(updateListenerName), []);

  return (
    <Query
      query={hfpQuery}
      variables={{
        date,
        uniqueVehicleId,
      }}>
      {({data, loading, refetch}) => {
        if (!loading) {
          setUpdateListener(updateListenerName, createRefetcher(refetch));
        }

        const journeys = get(data, "vehicleJourneys", []);
        return children({journeys, loading});
      }}
    </Query>
  );
});

export default VehicleJourneysQuery;
