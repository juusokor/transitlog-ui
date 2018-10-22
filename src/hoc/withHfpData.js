import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import get from "lodash/get";
import {createRouteKey} from "../helpers/hfpCache";
import withRoute from "./withRoute";
import {fetchHfpJourneys} from "../helpers/hfpQueryManager";
import Async from "react-async";
import {computed} from "mobx";

// To use while the promise is loading
let previouslyResolvedPositions = [];

export default (Component) => {
  @inject(app("Journey"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    @computed
    get fetchKey() {
      const {
        route,
        state: {date, requestedJourneys = []},
      } = this.props;

      return `${createRouteKey(route)}_${date}_${requestedJourneys
        .slice()
        .sort(
          (a, b) =>
            parseInt(a.replace(":", ""), 10) > parseInt(b.replace(":", ""), 10)
        )
        .join("&")}`;
    }

    // Creates a promise for awaiting the hfp result from the API or the cache.
    // React can't render async yet, so some mechanism to update the view when
    // an async result comes back is required. Remember that this runs *per instance*,
    // so the vast majority of work should be done in the `fetchHfpJourneys` method that runs
    // once for all instances when required.
    createFetchPromise = async () => {
      const {
        route,
        state: {date, requestedJourneys},
      } = this.props;

      return fetchHfpJourneys(route, date, requestedJourneys);
    };

    getComponent = (positions, loading) => (
      <Component
        key="withHfpDataComponent"
        {...this.props}
        loading={loading}
        positions={positions}
      />
    );

    onResolve = (data) => {
      const {Journey} = this.props;

      data.forEach(({journeyId}) => {
        const requestedTime = journeyId.slice(8).split("_")[1];
        Journey.removeJourneyRequest(requestedTime);
        Journey.setResolvedJourneyState(journeyId, "resolved");
      });
    };

    onError = (err) => {
      console.log(err);
    };

    render() {
      return (
        <Async
          initialValue={[]}
          watch={this.fetchKey}
          onResolve={this.onResolve}
          onReject={this.onError}
          promiseFn={this.createFetchPromise}>
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
