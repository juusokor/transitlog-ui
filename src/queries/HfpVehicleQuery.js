import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import {removeUpdateListener, setUpdateListener} from "../stores/UpdateManager";

export const hfpQuery = gql`
  query vehicleHfpQuery($date: date!, $vehicle_id: String!) {
    vehicles(
      order_by: {received_at: asc}
      where: {oday: {_eq: $date}, unique_vehicle_id: {_eq: $vehicle_id}}
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

const updateListenerName = "vehicle hfp query";

@observer
class HfpVehicleQuery extends React.Component {
  componentWillUnmount() {
    removeUpdateListener(updateListenerName);
  }

  onUpdate = (refetch) => () => {
    const {date, vehicleId, skip} = this.props;

    if (vehicleId && !skip) {
      refetch({
        date,
        vehicle_id: vehicleId,
      });
    }
  };

  render() {
    const {date, vehicleId, children} = this.props;

    return (
      <Query
        query={hfpQuery}
        variables={{
          date,
          vehicle_id: vehicleId,
        }}>
        {({data, loading, refetch}) => {
          setUpdateListener(updateListenerName, this.onUpdate(refetch));

          const vehicles = get(data, "vehicles", []);
          return children({positions: vehicles, loading});
        }}
      </Query>
    );
  }
}

export default HfpVehicleQuery;
