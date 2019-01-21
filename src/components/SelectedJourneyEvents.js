import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {createHfpItem} from "../helpers/createHfpItem";
import SelectedJourneyQuery from "../queries/SelectedJourneyQuery";
import getJourneyId from "../helpers/getJourneyId";
import get from "lodash/get";
import withRoute from "../hoc/withRoute";
import EnsureJourneySelection from "../helpers/EnsureJourneySelection";

@withRoute
@inject(app("state"))
@observer
class SelectedJourneyEvents extends Component {
  render() {
    const {children, state} = this.props;
    const {selectedJourney, route} = state;

    // Hide fetched selected journey HFP if the route is not selected
    const selectedJourneyValid =
      !!selectedJourney &&
      get(route, "routeId", "") === selectedJourney.route_id &&
      parseInt(get(route, "direction", 0), 10) ===
        parseInt(selectedJourney.direction_id, 10);

    return (
      <SelectedJourneyQuery
        skip={!selectedJourneyValid}
        selectedJourney={selectedJourney}>
        {({positions = [], loading, error}) => {
          if ((!positions || positions.length === 0) && !loading) {
            return (
              <EnsureJourneySelection
                events={null}
                eventsLoading={loading}
                error={error}>
                {children}
              </EnsureJourneySelection>
            );
          }

          if (!positions || positions.length === 0 || loading) {
            return (
              <EnsureJourneySelection
                events={[]}
                eventsLoading={loading}
                error={error}>
                {children}
              </EnsureJourneySelection>
            );
          }

          const events = positions
            // TODO: Fix when we have to deal with null coordinates
            .filter((pos) => !!pos.lat && !!pos.long)
            .map(createHfpItem);

          const journeyId = getJourneyId(events[0]);

          return (
            <EnsureJourneySelection
              events={[{journeyId, events}]}
              eventsLoading={loading}
              error={error}>
              {children}
            </EnsureJourneySelection>
          );
        }}
      </SelectedJourneyQuery>
    );
  }
}

export default SelectedJourneyEvents;
