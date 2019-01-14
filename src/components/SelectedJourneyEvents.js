import React, {Component} from "react";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import {createHfpItem} from "../helpers/createHfpItem";
import SelectedJourneyQuery from "../queries/SelectedJourneyQuery";
import getJourneyId from "../helpers/getJourneyId";

@inject(app("state"))
@observer
class SelectedJourneyEvents extends Component {
  render() {
    const {children, state} = this.props;
    const {selectedJourney} = state;

    const selectedJourneyValid = !!selectedJourney;

    return (
      <SelectedJourneyQuery
        skip={!selectedJourneyValid}
        selectedJourney={selectedJourney}>
        {({positions = [], loading, error}) => {
          if (!positions || positions.length === 0 || loading) {
            return children({events: [], loading, error});
          }

          const events = positions
            // TODO: Fix when we have to deal with null coordinates
            .filter((pos) => !!pos.lat && !!pos.long)
            .map(createHfpItem);

          const journeyId = getJourneyId(events[0]);

          return children({
            events: [{journeyId, events}],
            loading,
            error,
          });
        }}
      </SelectedJourneyQuery>
    );
  }
}

export default SelectedJourneyEvents;
