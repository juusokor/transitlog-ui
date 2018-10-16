import React from "react";
import withHfpData from "./withHfpData";
import {observer, inject} from "mobx-react";
import getJourneyId from "../helpers/getJourneyId";
import get from "lodash/get";
import {app} from "mobx-app";

export default (Component) => {
  @inject(app("state"))
  @withHfpData
  @observer
  class WithSelectedJourneyHfp extends React.Component {
    render() {
      const {state, positions} = this.props;

      if (!state.selectedJourney) {
        return (
          <Component
            key="withSelectedJourneyComponent"
            {...this.props}
            selectedJourneyHfp={[]}
          />
        );
      }

      const selectedJourneyId = getJourneyId(state.selectedJourney);

      const journeyHfp = positions.find(
        ({journeyId}) => journeyId === selectedJourneyId
      );

      return (
        <Component
          key="withSelectedJourneyComponent"
          {...this.props}
          selectedJourneyHfp={get(journeyHfp, "positions", [])}
        />
      );
    }
  }

  return WithSelectedJourneyHfp;
};
