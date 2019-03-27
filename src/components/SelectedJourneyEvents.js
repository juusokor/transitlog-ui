import React from "react";
import {observer} from "mobx-react-lite";
import JourneyQuery from "../queries/JourneyQuery";
import flow from "lodash/flow";
import {inject} from "../helpers/inject";
import {createRouteId} from "../helpers/keys";

const decorate = flow(
  observer,
  inject("state")
);

const SelectedJourneyEvents = decorate(({children, state}) => {
  const {selectedJourney, route} = state;

  // Hide fetched selected journey HFP if the route is not selected
  const selectedJourneyValid =
    !!selectedJourney && createRouteId(route) === createRouteId(selectedJourney);

  return (
    <JourneyQuery skip={!selectedJourneyValid} journey={selectedJourney}>
      {({journey = null, loading, error}) => children({journey, loading, error})}
    </JourneyQuery>
  );
});

export default SelectedJourneyEvents;
