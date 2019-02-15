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
import {createCompositeJourney} from "../stores/journeyActions";
import {departureTime, timeToSeconds} from "../helpers/time";

export const journeyHfpStates = {
  LOADING: "loading",
  NOT_FOUND: "not found",
  INCOMPLETE: "incomplete",
};

@inject(app("Journey", "Filters"))
@withRoute({alwaysFetch: true})
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
                    // Map the departures to a structure with all the info we want
                    // to display in the journey list.
                    departures.map((departure) => {
                      // Extend the hours past 24 for journeys that span many days
                      const timeStr = departureTime(departure);

                      // To match the departure with a set of HFP events, create a
                      // composite journey with all the right information
                      const departureJourney = createCompositeJourney(
                        date,
                        departure,
                        timeStr,
                        0
                      );

                      // A theoretically-valid journey id can be derived from the departure data
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
                  // Sort the list by the departure time.
                  ({time}) => timeToSeconds(time)
                );

                if (Object.keys(journeys).length === 0) {
                  return children({journeys: sortedJourneys, loading: isLoading});
                }

                // Map HFP journeys to the departures through the journey id.
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
