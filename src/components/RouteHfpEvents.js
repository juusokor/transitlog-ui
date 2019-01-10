import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "../hoc/withRoute";
import getJourneyId from "../helpers/getJourneyId";
import sortBy from "lodash/sortBy";
import get from "lodash/get";
import DeparturesQuery from "../queries/DeparturesQuery";
import HfpQuery from "../queries/HfpQuery";
import doubleDigit from "../helpers/doubleDigit";
import {createCompositeJourney} from "../stores/journeyActions";
import {sortByOperationDay} from "../helpers/sortByOperationDay";

@inject(app("Journey", "Filters"))
@withRoute
@observer
class RouteHfpEvents extends React.Component {
  render() {
    const {children, state} = this.props;
    const {date, route} = state;

    return (
      <DeparturesQuery route={route} date={date}>
        {({departures, loading: departuresLoading}) => (
          <HfpQuery route={route} date={date}>
            {({journeys, loading: journeysLoading}) => {
              const isLoading = departuresLoading || journeysLoading;

              const sortedJourneys = sortBy(
                departures.map((departure) => {
                  const timeStr = `${doubleDigit(departure.hours)}:${doubleDigit(
                    departure.minutes
                  )}:00`;

                  const departureRoute = {
                    routeId: departure.routeId,
                    direction: departure.direction,
                  };

                  const departureJourney = createCompositeJourney(
                    date,
                    departureRoute,
                    timeStr
                  );

                  const journeyId = getJourneyId(departureJourney);

                  return {
                    journeyId,
                    events: [],
                    departure,
                    time: timeStr,
                  };
                }),
                ({time}) => sortByOperationDay(time)
              );

              if (journeys.length === 0) {
                return children({journeys: sortedJourneys, loading: isLoading});
              }

              const departureJourneys = sortedJourneys.map((plannedJourney) => {
                const journey = journeys.find(
                  (journey) => journey.journeyId === plannedJourney.journeyId
                );

                return {...plannedJourney, events: get(journey, "events", [])};
              });

              return children({journeys: departureJourneys, loading: isLoading});
            }}
          </HfpQuery>
        )}
      </DeparturesQuery>
    );
  }
}

export default RouteHfpEvents;
