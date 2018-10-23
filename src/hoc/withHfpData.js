import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "./withRoute";
import {fetchHfpJourney} from "../helpers/hfpQueryManager";
import {observable, reaction, action, flow} from "mobx";
import {journeyFetchStates} from "../stores/JourneyStore";
import getJourneyId from "../helpers/getJourneyId";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import pMap from "p-map";

// TODO: Fetch the departures starting from the selectedJourney outward.
// TODO: Find out why it's so heavy to fetch cached journeys

export default (Component) => {
  @inject(app("Journey"))
  @withRoute
  @observer
  class WithHfpData extends React.Component {
    @observable.shallow
    currentView = [];

    @observable
    loading = false;

    @action
    setLoading = (value = !this.loading) => {
      this.loading = value;
    };

    fetchRequestedJourneys = async () => {
      const {
        route,
        state: {date, requestedJourneys = []},
      } = this.props;

      const ctx = this;
      this.setLoading(true);

      const fetchAllFlow = flow(function*() {
        const fetcher = (departure) => ctx.fetchDeparture(route, date, departure);
        yield pMap(requestedJourneys, fetcher, {concurrency: 3});

        ctx.setLoading(false);
      });

      return fetchAllFlow();
    };

    fetchDeparture = async (route, date, departure) => {
      const {Journey} = this.props;
      const ctx = this;

      const fetchFlow = flow(function*() {
        const [journey] = yield fetchHfpJourney(route, date, departure);

        Journey.removeJourneyRequest(departure);

        if (journey) {
          Journey.setJourneyFetchState(
            journey.journeyId,
            journeyFetchStates.RESOLVED
          );

          const nextView = orderBy(
            uniqBy([...ctx.currentView, journey], "journeyId"),
            ({journeyId}) => {
              const keyParts = journeyId.slice(8).split("_");
              return keyParts[1].replace(":", "");
            }
          );

          ctx.currentView.replace(nextView);
        } else {
          Journey.setJourneyFetchState(
            getJourneyId(Journey.getJourneyFromStateAndTime(departure)),
            journeyFetchStates.NOTFOUND
          );
        }
      });

      return fetchFlow();
    };

    onError = (err) => {
      // The error is per fetched journey, so some way to match errors
      // to requested times is necessary. TODO!
      console.log(err);
    };

    componentDidMount() {
      reaction(
        () => this.props.state.requestedJourneys.length,
        async (requestedCount) => {
          if (requestedCount !== 0) {
            await this.fetchRequestedJourneys();
          }
        }
      );
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
