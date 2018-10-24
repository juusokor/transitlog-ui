import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "./withRoute";
import {fetchHfpJourney, loadCache, persistCache} from "../helpers/hfpQueryManager";
import {observable, reaction, action, runInAction} from "mobx";
import {journeyFetchStates} from "../stores/JourneyStore";
import getJourneyId from "../helpers/getJourneyId";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import pAll from "p-all";
import idle from "../helpers/idle";
import {createFetchKey} from "../helpers/keys";

export default (Component) => {
  @inject(app("Journey"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    @observable.shallow
    currentView = [];

    @observable
    loading = false;

    fetchReaction = () => {};
    resetReaction = () => {};

    @action
    setLoading = (value = !this.loading) => {
      this.loading = value;
    };

    @action
    resetView = () => {
      this.currentView.clear();
    };

    fetchRequestedJourneys = async () => {
      const {
        route,
        state: {date, requestedJourneys = []},
      } = this.props;

      this.setLoading(true);

      const journeyPromises = requestedJourneys.map(
        (departure, index) => async () => {
          // Do the first fetch asap without waiting
          if (index !== 0) {
            // Wait for a quiet moment...
            await idle();
          }

          return this.fetchDeparture(route, date, departure);
        }
      );

      await pAll(journeyPromises, {concurrency: 5});
      this.setLoading(false);

      await persistCache();
    };

    fetchDeparture = async (route, date, departure) => {
      const {Journey} = this.props;
      const [journey] = await fetchHfpJourney(route, date, departure);

      Journey.removeJourneyRequest(departure);

      if (journey) {
        Journey.setJourneyFetchState(journey.journeyId, journeyFetchStates.RESOLVED);

        const nextView = orderBy(
          uniqBy([...this.currentView, journey], "journeyId"),
          ({journeyId}) => {
            const keyParts = journeyId.slice(8).split("_");
            return keyParts[1].replace(":", "");
          }
        );

        runInAction(() => this.currentView.replace(nextView));
      } else {
        Journey.setJourneyFetchState(
          getJourneyId(Journey.getJourneyFromStateAndTime(departure)),
          journeyFetchStates.NOTFOUND
        );
      }
    };

    onError = (err) => {
      // The error is per fetched journey, so some way to match errors
      // to requested times is necessary. TODO!
      console.log(err);
    };

    async componentDidMount() {
      this.fetchReaction = reaction(
        () => {
          const {
            state: {
              requestedJourneys,
              date,
              route: {routeId = ""},
            },
          } = this.props;

          return requestedJourneys.length || date || routeId;
        },
        () => this.fetchRequestedJourneys()
      );

      // Reset the view if the fetchKey (without time) changes.
      this.resetReaction = reaction(
        () => {
          const {
            route,
            state: {date},
          } = this.props;

          return createFetchKey(route, date, true);
        },
        (fetchKey) => {
          if (fetchKey) {
            this.resetView();
          }
        }
      );

      await loadCache();
    }

    componentWillUnmount() {
      if (typeof this.fetchReaction === "function") {
        this.fetchReaction();
      }

      if (typeof this.resetReaction === "function") {
        this.resetReaction();
      }
    }

    render() {
      return (
        <Component
          key="withHfpDataComponent"
          {...this.props}
          loading={this.loading}
          positions={this.currentView}
        />
      );
    }
  }

  return WithHfpData;
};
