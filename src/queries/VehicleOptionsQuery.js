import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {setUpdateListener} from "../stores/UpdateManager";

const vehiclesQuery = gql`
  query vehicleOptionsQuery {
    allEquipment {
      nodes {
        operatorId
        registryNr
        vehicleId
      }
    }
  }
`;

const availableVehiclesQuery = gql`
  query availableVehicleOptionsQuery($date: date) {
    vehicles(
      distinct_on: [unique_vehicle_id]
      order_by: [{unique_vehicle_id: asc}]
      where: {oday: {_eq: $date}, geohash_level: {_eq: 1}}
    ) {
      unique_vehicle_id
      vehicle_number
      owner_operator_id
    }
  }
`;

const updateListenerName = "vehicle options query";

export default observer(({children, date, skip}) => (
  <Query query={vehiclesQuery} skip={skip}>
    {({loading, error, data}) => {
      if (loading || !data) {
        return children({loading, error, vehicles: []});
      }

      const joreVehicles = get(data, "allEquipment.nodes", []);

      return (
        <Query query={availableVehiclesQuery} skip={skip} variables={{date}}>
          {({data: hfpData = [], loading: hfpLoading, refetch}) => {
            setUpdateListener(updateListenerName, refetch, false);

            const hfpVehicles = get(hfpData, "vehicles", []);

            const vehicles = joreVehicles.map((vehicle) => {
              const joreVehicleId = `${vehicle.operatorId}/${vehicle.vehicleId}`;

              const hfpVehicle = hfpVehicles.find(
                ({owner_operator_id, vehicle_number}) => {
                  const ownerId = (owner_operator_id + "").padStart(4, "0");
                  const hfpVehicleId = `${ownerId}/${vehicle_number}`;

                  return hfpVehicleId === joreVehicleId;
                }
              );

              return {
                ...vehicle,
                inServiceOnDate: !!hfpVehicle,
              };
            });

            return children({
              loading: loading || hfpLoading,
              error,
              vehicles,
            });
          }}
        </Query>
      );
    }}
  </Query>
));
