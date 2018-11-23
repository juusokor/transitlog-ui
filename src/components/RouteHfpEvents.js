import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "../hoc/withRoute";
import {fetchHfpJourney, loadCache, persistCache} from "../helpers/hfpQueryManager";
import {observable, reaction, action, runInAction} from "mobx";
import {journeyFetchStates} from "../stores/JourneyStore";
import getJourneyId from "../helpers/getJourneyId";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import {createFetchKey, createRouteKey} from "../helpers/keys";
import pMap from "p-map";

@inject(app("Journey", "Filters"))
@withRoute
@observer
class RouteHfpEvents extends React.Component {
  @observable.shallow
  currentView = [];

  currentViewKey = "";

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

  getStateRoute = (partialRoute) => {
    const {
      state: {route},
    } = this.props;

    // Ensures that the request has access to the full route data.
    if (
      route &&
      partialRoute.routeId === route.routeId &&
      partialRoute.direction === route.direction
    ) {
      return route;
    }

    return partialRoute;
  };

  fetchRequestedJourneys = async (requestedJourneys) => {
    this.setLoading(true);
    await pMap(requestedJourneys, this.fetchJourney, {concurrency: 3});
    await this.onFetchCompleted();
  };

  fetchJourney = async (journeyRequest) => {
    const {Journey} = this.props;
    const {route, date, time, skipCache = false} = journeyRequest;

    const useRoute = this.getStateRoute(route);
    const journeys = await fetchHfpJourney(useRoute, date, time, skipCache);

    if (journeys.length === 0) {
      Journey.setJourneyFetchState(
        getJourneyId(
          Journey.createCompositeJourney(date, route, journeyRequest.time)
        ),
        journeyFetchStates.NOTFOUND
      );
    }

    this.onReceivedJourneys(journeys, journeyRequest);
  };

  onReceivedJourneys = async (fetchedJourneys, journeyRequest) => {
    const {
      Journey,
      Filters,
      state: {selectedJourney},
    } = this.props;

    const journeys = Array.isArray(fetchedJourneys)
      ? fetchedJourneys
      : [fetchedJourneys];

    Journey.removeJourneyRequest(journeyRequest);

    for (const journey of journeys) {
      Journey.setJourneyFetchState(journey.journeyId, journeyFetchStates.RESOLVED);

      const nextView = orderBy(
        uniqBy([...this.currentView, journey], "journeyId"),
        ({journeyId}) => {
          const keyParts = journeyId.slice(8).split("_");
          return keyParts[1].replace(":", "");
        }
      );

      if (selectedJourney && getJourneyId(selectedJourney) === journey.journeyId) {
        const journeyVehicle = get(journey, "positions[0].unique_vehicle_id", "");

        if (journeyVehicle) {
          Filters.setVehicle(journeyVehicle);
        }
      }

      runInAction(() => this.currentView.replace(nextView));
    }
  };

  onFetchCompleted = async () => {
    this.setLoading(false);
    await persistCache();
  };

  onError = (err) => {
    // The error is per fetched journey, so some way to match errors
    // to requested times is necessary. TODO!
    console.log(err);
  };

  componentDidMount() {
    const {state} = this.props;

    this.fetchReaction = reaction(
      () => {
        const {skip} = this.props;

        if (skip) {
          return [];
        }

        const reqJourneys = state.requestedJourneys.slice(); // Slice to tell mobx that we used this array
        const routeKey = createRouteKey(state.route);

        if (reqJourneys.length && !!routeKey && !this.loading) {
          return reqJourneys;
        }

        return [];
      },
      (reqJourneys) => {
        if (reqJourneys.length !== 0 && !this.loading) {
          this.fetchRequestedJourneys(reqJourneys);
        }
      }
    );

    // Reset the view if the fetchKey (without time, but still
    // falseable if the date or route is missing) changes.
    this.resetReaction = reaction(
      () => createFetchKey(state.route, state.date, true),
      (fetchKey) => {
        if (!fetchKey || fetchKey !== this.currentViewKey) {
          this.resetView();
          this.currentViewKey = fetchKey;
        }
      },
      {fireImmediately: true}
    );

    loadCache();
  }

  componentWillUnmount() {
    // Clear the reactions if unmounted
    if (typeof this.fetchReaction === "function") {
      this.fetchReaction();
    }
    if (typeof this.resetReaction === "function") {
      this.resetReaction();
    }
  }

  render() {
    const {children} = this.props;
    return children({positions: this.currentView, loading: this.loading});
  }
}

export default RouteHfpEvents;
