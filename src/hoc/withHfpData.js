import {observer, inject} from "mobx-react";
import {observable, computed, runInAction, trace} from "mobx";
import {app} from "mobx-app";
import React from "react";
import {getCachedData, cacheData, getCacheKey} from "../helpers/hfpCache";
import groupBy from "lodash/groupBy";
import map from "lodash/map";
import get from "lodash/get";
import HfpQuery from "../queries/HfpQuery";
import takeEveryNth from "../helpers/takeEveryNth";
import withRoute from "./withRoute";
import getJourneyId from "../helpers/getJourneyId";

const formatData = (hfpData) => {
  if (hfpData.length === 0) {
    return hfpData;
  }

  return (
    takeEveryNth(hfpData, 2) // Take every other hfp item.
      // Some HFP items are null for one reason or another. Filter those out.
      .filter((pos) => !!pos && !!pos.lat && !!pos.long)
  );
};

const getGrouped = (hfpData, groupKey, groupNameKey) => {
  if (!hfpData || hfpData.length === 0) {
    return [];
  }

  trace();

  const groupedData = groupBy(hfpData, groupKey);
  const vehicleGroups = map(groupedData, (positions, groupName) => ({
    [groupNameKey]: groupName,
    positions,
  }));

  return vehicleGroups;
};

const getGroupedByVehicle = (positions) =>
  getGrouped(positions, "uniqueVehicleId", "vehicleId");

const getGroupedByJourney = (positions) =>
  getGrouped(positions, getJourneyId, "journeyId");

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    hfpCache = observable.map({}, {deep: false});

    @computed
    get cachedHfp() {
      const {
        state: {date},
        route,
      } = this.props;

      if (!route || !get(route, "routeId", "")) {
        return [];
      }

      const cacheKey = getCacheKey(date, route);

      if (cacheKey) {
        const existingCache = this.hfpCache.get(cacheKey);

        if (!existingCache) {
          getCachedData(date, route).then((cachedHfp) => {
            if (cachedHfp && cachedHfp.length !== 0) {
              runInAction(() => this.hfpCache.set(cacheKey, cachedHfp));
            }
          });

          return [];
        }

        return existingCache;
      }

      return [];
    }

    getComponent = (positions, loading) => (
      <Component
        {...this.props}
        loading={loading}
        positionsByVehicle={getGroupedByVehicle(positions)}
        positionsByJourney={getGroupedByJourney(positions)}
      />
    );

    render() {
      const {
        state: {date},
        route,
      } = this.props;

      return !this.cachedHfp || this.cachedHfp.length === 0 ? (
        <HfpQuery route={route} date={date}>
          {({hfpPositions, loading}) => {
            if (loading || hfpPositions.length === 0) {
              return this.getComponent([], loading);
            }

            const formattedPositions = formatData(hfpPositions);
            cacheData(formattedPositions, date, route);

            return this.getComponent(formattedPositions, loading);
          }}
        </HfpQuery>
      ) : (
        this.getComponent(this.cachedHfp, false)
      );
    }
  }

  return WithHfpData;
};
