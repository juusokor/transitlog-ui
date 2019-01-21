import {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

/*
  A helper component to deselect a selected journey that does not exist
  if one such journey has somehow become selected.
 */

@inject(app("Journey"))
@observer
class EnsureJourneySelection extends Component {
  componentDidUpdate() {
    const {events, eventsLoading, Journey} = this.props;

    if (!events && !eventsLoading) {
      Journey.setSelectedJourney(null);
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
