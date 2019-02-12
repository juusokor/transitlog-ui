import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {createHfpItem} from "../helpers/createHfpItem";
import SelectedJourneyQuery from "../queries/SelectedJourneyQuery";
import getJourneyId from "../helpers/getJourneyId";
import get from "lodash/get";
import withRoute from "../hoc/withRoute";
import EnsureJourneySelection from "../helpers/EnsureJourneySelection";
import moment from "moment-timezone";
import {TIMEZONE} from "../constants";

@inject(app("state"))
@withRoute()
@observer
class SelectedJourneyEvents extends Component {
  renderChildren = (children, events = [], loading = false, error = null) => (
    <EnsureJourneySelection events={events} eventsLoading={loading} error={error}>
      {children}
    </EnsureJourneySelection>
  );

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
          if ((positions.length === 0 && !loading) || error) {
            return this.renderChildren(children, [], false, error);
          }

          if (positions.length === 0 || loading) {
            return this.renderChildren(children, positions, loading, error);
          }

          const filteredEvents = positions
            // TODO: Fix when we have to deal with null coordinates
            .filter((pos) => !!pos.lat && !!pos.long && !!pos.journey_start_time);

          // Get the real date when this journey started. This will let us determine
          // on which side of the 24h+ day the journey happened.
          const realStartMoment = moment.tz(positions[0].tst, TIMEZONE);

          const events = filteredEvents.map((item) =>
            createHfpItem(item, realStartMoment)
          );

          const journeyId = getJourneyId(events[0]);

          return this.renderChildren(
            children,
            [{journeyId, events}],
            loading,
            error
          );
        }}
      </SelectedJourneyQuery>
    );
  }
}

export default SelectedJourneyEvents;
