import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import HfpVehicleQuery from "../queries/HfpVehicleQuery";
import map from "lodash/map";
import groupBy from "lodash/groupBy";
import orderBy from "lodash/orderBy";
import {findJourneyStartPosition} from "../helpers/findJourneyStartPosition";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithVehicleJourneysComponent extends React.Component {
    render() {
      const {
        loading: propsLoading,
        state: {date, vehicle},
      } = this.props;

      return (
        <HfpVehicleQuery vehicleId={vehicle} date={date}>
          {({positions = [], loading}) => {
            // Forward loading state from props
            const isLoading = propsLoading ? true : loading;

            // Group and order by journey_start_time, and get the HFP item that
            // represents the start of the journey.
            const vehicleJourneys = map(
              groupBy(
                orderBy(positions, "journey_start_time"),
                "journey_start_time"
              ),
              (positions) => findJourneyStartPosition(positions)
            );

            return (
              <Component
                {...this.props}
                positions={vehicleJourneys}
                loading={isLoading}
              />
            );
          }}
        </HfpVehicleQuery>
      );
    }
  }

  return WithVehicleJourneysComponent;
};
