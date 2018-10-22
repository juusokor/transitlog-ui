import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import get from "lodash/get";
import {createFetchKey} from "../helpers/hfpCache";
import withRoute from "./withRoute";
import {fetchHfp} from "../helpers/hfpQueryManager";
import Async from "react-async";

// To use while the promise is loading
let previouslyResolvedPositions = [];

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    // Creates a promise for awaiting the hfp result from the API or the cache.
    // React can't render async yet, so some mechanism to update the view when
    // an async result comes back is required. Remember that this runs *per instance*,
    // so the vast majority of work should be done in the `fetchHfp` method that runs
    // once for all instances when required.
    createFetchPromise = async ({route, date, time}) => {
      return fetchHfp(route, date, time);
    };

    getComponent = (positions, loading) => (
      <Component
        key="withHfpDataComponent"
        {...this.props}
        loading={loading}
        positions={positions}
      />
    );

    render() {
      const {
        route,
        state: {date, time, selectedJourney},
      } = this.props;

      const fetchKey = createFetchKey(route, date, time);
      // Use the time from the selected journey if one is selected.
      // This prevents unnecessary fetches from happening while a journey is selected.
      const useTime = get(selectedJourney, "journey_start_time", time);

      return (
        <Async
          watch={fetchKey}
          promiseFn={this.createFetchPromise}
          time={useTime}
          date={date}
          route={route}>
          {({data, error, loading}) => {
            if (!data || data.length === 0) {
              return this.getComponent(previouslyResolvedPositions, loading);
            }

            previouslyResolvedPositions = data;
            return this.getComponent(data, false);
          }}
        </Async>
      );
    }
  }

  return WithHfpData;
};
