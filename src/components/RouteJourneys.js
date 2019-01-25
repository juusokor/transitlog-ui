import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "../hoc/withRoute";
import getJourneyId from "../helpers/getJourneyId";
import sortBy from "lodash/sortBy";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import DeparturesQuery from "../queries/DeparturesQuery";
import JourneysByDateQuery from "../queries/JourneysByDateQuery";
import doubleDigit from "../helpers/doubleDigit";
import {createCompositeJourney} from "../stores/journeyActions";
import {sortByTime} from "../helpers/sortByTime";
import {getTimeString} from "../helpers/time";

export const journeyHfpStates = {
  LOADING: "loading",
  NOT_FOUND: "not found",
  INCOMPLETE: "incomplete",
};

@inject(app("Journey", "Filters"))
@withRoute
@observer
class RouteJourneys extends React.Component {
  render() {
    const {children, state} = this.props;
    const {date, route} = state;

    return (
      <DeparturesQuery route={route} date={date}>
        {({departures, loading: departuresLoading}) => {
          return (
            <JourneysByDateQuery route={route} date={date}>
              {({journeys, loading: journeysLoading}) => {
                const isLoading = departuresLoading || journeysLoading;

                const sortedJourneys = sortBy(
                  uniqBy(
                    departures.map((departure) => {
                      const {isNextDay, hours} = departure;
                      const hour = isNextDay ? hours + 24 : hours;

                      const timeStr = getTimeString(hour, departure.minutes);

                      const departureJourney = createCompositeJourney(
                        date,
                        departure,
                        timeStr
                      );

                      const journeyId = getJourneyId(departureJourney);

                      return {
                        journeyId,
                        events: journeysLoading
                          ? journeyHfpStates.LOADING
                          : journeyHfpStates.NOT_FOUND,
                        departure,
                        time: timeStr,
                      };
                    }),
                    "journeyId"
                  ),
                  ({time}) => sortByTime(time)
                );

                if (Object.keys(journeys).length === 0) {
                  return children({journeys: sortedJourneys, loading: isLoading});
                }

                const departureJourneys = sortedJourneys.map((plannedJourney) => {
                  const journey = get(journeys, plannedJourney.journeyId, null);
                  return {
                    ...plannedJourney,
                    events: !journey ? journeyHfpStates.NOT_FOUND : [journey],
                  };
                });

                return children({journeys: departureJourneys, loading: isLoading});
              }}
            </JourneysByDateQuery>
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default RouteJourneys;
