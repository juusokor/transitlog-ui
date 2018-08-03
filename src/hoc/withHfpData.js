import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import HfpQuery from "../queries/HfpQuery";
import {getCachedData, cacheData} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithHfpData extends React.Component {
    formatData = (hfpData) => {
      if (hfpData.length === 0) {
        return hfpData;
      }

      const groupedData = groupBy(hfpData, "uniqueVehicleId");
      return map(groupedData, (positions, groupName) => ({
        vehicleId: groupName,
        positions,
      }));
    };

    getComponent = (hfpPositions = [], loading = false) => (
      <Component {...this.props} loading={loading} hfpPositions={hfpPositions} />
    );

    render() {
      const {
        state: {date, selectedRoute},
      } = this.props;
      let hfpPositions = getCachedData(date, selectedRoute);

      return (
        <React.Fragment>
          {hfpPositions.length === 0 ? (
            <HfpQuery route={selectedRoute} queryDate={date}>
              {({hfpPositions, loading}) => {
                if (loading) {
                  return this.getComponent([], true);
                }

                const formattedPositions = this.formatData(hfpPositions);
                cacheData(formattedPositions);
                return this.getComponent(formattedPositions);
              }}
            </HfpQuery>
          ) : (
            this.getComponent(hfpPositions)
          )}
        </React.Fragment>
      );
    }
  }

  return WithHfpData;
};
