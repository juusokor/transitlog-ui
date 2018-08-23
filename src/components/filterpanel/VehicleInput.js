import React from "react";
import SuggestionInput from "./SuggestionInput";
import sortBy from "lodash/sortBy";
import flow from "lodash/flow";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import keys from "lodash/keys";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";

const getSuggestionValue = (suggestion) => suggestion;

const renderSuggestion = (suggestion) => (
  <span className="suggestion-content">
    <div className="suggestion-text">{getSuggestionValue(suggestion)}</div>
  </span>
);

const getSuggestions = (vehicleIds) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  const suggestionIds =
    inputLength === 0 || vehicleIds.length === 0
      ? vehicleIds
      : vehicleIds.filter((item) => item.includes(inputValue));

  return suggestionIds.length !== 0 ? suggestionIds : [inputValue];
};

const enhance = flow(
  inject(app("state")),
  withHfpData,
  observer
);

// TODO: Fix this

export default enhance(
  ({
    vehicle = "",
    onChange,
    onSelect,
    state,
    positionsByVehicle,
    positionsByJourney,
  }) => {
    const selectedJourneyId = getJourneyId(state.selectedJourney);
    const options = selectedJourneyId
      ? keys(
          groupBy(
            get(
              positionsByJourney.find((j) => j.journeyId === selectedJourneyId),
              "positions",
              []
            ),
            "uniqueVehicleId"
          )
        )
      : keys(positionsByVehicle);

    return (
      <SuggestionInput
        minimumInput={0}
        placeholder="Hae kulkuneuvoa"
        value={vehicle}
        onSelect={onSelect}
        onChange={onChange}
        getValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        getSuggestions={getSuggestions(options)}
      />
    );
  }
);
