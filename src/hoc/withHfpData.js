import {observer, inject} from "mobx-react";
import {observable, action} from "mobx";
import {app} from "mobx-app";
import React from "react";
import HfpQuery from "../queries/HfpQuery";
import {getCachedData, cacheData} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import takeEveryNth from "../helpers/takeEveryNth";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithHfpData extends React.Component {
    @observable.struct hfpPositions = [];
    @observable cacheLoaded = false;

    async componentDidMount() {
      const {date, route} = this.props.state;
      const cachedHfp = await getCachedData(date, route);
      this.setHfpPositions(cachedHfp);
    }

    formatData = (hfpData) => {
      if (hfpData.length === 0) {
        return hfpData;
      }

      const groupedData = groupBy(hfpData, "uniqueVehicleId");
      return map(groupedData, (positions, groupName) => ({
        vehicleId: groupName,
        positions: takeEveryNth(positions, 5) // Take only every third item from the collection.
          // Some HFP items are null for one reason or another. Filter those out.
          .filter((pos) => !!pos && !!pos.lat && !!pos.long),
      }));
    };

    getComponent = (hfpPositions = [], loading = false) => (
      <Component {...this.props} loading={loading} hfpPositions={hfpPositions} />
    );

    @action
    setHfpPositions(positions) {
      this.hfpPositions = positions;
      this.cacheLoaded = true;
    }

    render() {
      const {date, route} = this.props.state;

      return (
        <React.Fragment>
          {this.cacheLoaded && this.hfpPositions.length === 0 ? (
            <HfpQuery route={route} date={date}>
              {({hfpPositions, loading}) => {
                if (loading || hfpPositions.length === 0) {
                  return this.getComponent([], loading);
                }

                const formattedPositions = this.formatData(hfpPositions);
                cacheData(formattedPositions, date, route);

                return this.getComponent(formattedPositions);
              }}
            </HfpQuery>
          ) : (
            this.getComponent(this.hfpPositions)
          )}
        </React.Fragment>
      );
    }
  }

  return WithHfpData;
};
