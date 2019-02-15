import {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";

/*
  A helper component to deselect a selected journey that does not exist
  if one such journey has somehow become selected.
 */

@inject(app("Journey", "Filters"))
@observer
class EnsureJourneySelection extends Component {
  componentDidUpdate() {
    this.checkStatus();
  }

  checkStatus() {
    const {events, eventsLoading, Journey, Filters} = this.props;

    if ((!events || events.length === 0) && !eventsLoading) {
      Journey.setSelectedJourney(null);
    } else if (events && !eventsLoading) {
      const vehicleId = get(events, "[0].events[0].unique_vehicle_id", "");
      Filters.setVehicle(vehicleId);
      Journey.setJourneyVehicle(vehicleId);
    }
  }

  render() {
    const {events, eventsLoading, error, children} = this.props;
    return children({
      events,
      loading: eventsLoading,
      error,
    });
  }
}

export default EnsureJourneySelection;
