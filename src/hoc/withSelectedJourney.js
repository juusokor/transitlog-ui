import React from "react";
import {observer, inject} from "mobx-react";
import getJourneyId from "../helpers/getJourneyId";
import get from "lodash/get";
import {app} from "mobx-app";

export default (Component) => {
  @inject(app("state"))
  @observer
  class WithSelectedJourneyComponent extends React.Component {
    render() {
      const {state, positions = []} = this.props;

      if (!state.selectedJourney) {
        return <Component {...this.props} selectedJourneyHfp={[]} />;
      }

      const selectedJourneyId = getJourneyId(state.selectedJourney);

      const journeyHfp = positions.find(
        ({journeyId}) => journeyId === selectedJourneyId
      );

      return (
        <Component
          {...this.props}
          selectedJourneyHfp={get(journeyHfp, "events", [])}
        />
      );
    }
  }

  return WithSelectedJourneyComponent;
};
