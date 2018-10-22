import {inject, observer, Observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "./withRoute";
import {fetchHfpJourney} from "../helpers/hfpQueryManager";
import Async from "react-async";
import {computed, observable, flow, runInAction} from "mobx";
import {journeyFetchStates} from "../stores/JourneyStore";
import getJourneyId from "../helpers/getJourneyId";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import {createRouteKey} from "../helpers/hfpCache";

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
              ? 1
              : -1
        )
        .join("&")}`;
    }

    @observable.shallow
    currentView = [];

    createFetcher = async ({requestedJourneys, route, date}) => {
      for (const departure of requestedJourneys) {
        await this.fetchDeparture(route, date, departure);
      }
    };

    fetchDeparture = async (route, date, departure) => {
      const {Journey} = this.props;
      const [journey] = await fetchHfpJourney(route, date, departure);

      runInAction(() => {
        Journey.removeJourneyRequest(departure);

        if (journey) {
          Journey.setJourneyFetchState(
            journey.journeyId,
            journeyFetchStates.RESOLVED
          );

          const nextView = orderBy(
            uniqBy([...this.currentView, journey], "journeyId"),
            ({journeyId}) => {
              const keyParts = journeyId.slice(8).split("_");
              return keyParts[1];
            }
          );

          this.currentView.replace(nextView);
        } else {
          Journey.setJourneyFetchState(
            getJourneyId(Journey.getJourneyFromStateAndTime(departure)),
            journeyFetchStates.NOTFOUND
          );
        }
      });
    };

    onError = (err) => {
      // The error is per fetched journey, so some way to match errors
      // to requested times is necessary. TODO!
      console.log(err);
    };

    render() {
      const {
        route,
        state: {date, requestedJourneys = []},
      } = this.props;

      return (
        <Async
          watch={this.fetchKey}
          requestedJourneys={requestedJourneys}
          route={route}
          date={date}
          initialValue={[]}
          onReject={this.onError}
          promiseFn={this.createFetcher}>
          {({data, error, loading}) => {
            return (
              <Observer>
                {() => (
                  <Component
                    key="withHfpDataComponent"
                    {...this.props}
                    loading={loading}
                    positions={this.currentView}
                  />
                )}
              </Observer>
            );
          }}
        </Async>
      );
    }
  }

  return WithHfpData;
};
