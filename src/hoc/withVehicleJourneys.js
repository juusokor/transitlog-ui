import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import {HfpVehicleQuery} from "../queries/HfpVehicleQuery";
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
        state: {date, vehicle},
      } = this.props;

      return (
        <HfpVehicleQuery vehicleId={vehicle} date={date}>
          {({positions = [], loading}) => {
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
                loading={loading}
              />
            );
          }}
        </HfpVehicleQuery>
      );
    }
  }

  return WithVehicleJourneysComponent;
};
