import React from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionSectionTitle,
} from "./SuggestionInput";
import flow from "lodash/flow";
import get from "lodash/get";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

const getSuggestionValue = (suggestion) =>
  get(suggestion, "unique_vehicle_id", suggestion);

const renderSuggestion = (suggestion, {query, isHighlighted}) => (
  <SuggestionContent isHighlighted={isHighlighted}>
    <SuggestionText>{getSuggestionValue(suggestion)}</SuggestionText>
  </SuggestionContent>
);

const renderSectionTitle = (section) => (
  <SuggestionSectionTitle>
    {section.operatorName} ({section.operatorId})
  </SuggestionSectionTitle>
);

const getSectionSuggestions = (section) => section.vehicles;

const getSuggestions = (operators) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  const suggestionIds =
    inputLength === 0 || operators.length === 0
      ? operators
      : operators.reduce((matches, operator) => {
          // Match input value to operator name first.
          if (operator.operatorName.toLowerCase().includes(inputValue)) {
            matches.push(operator);
            return matches;
          }

          // Search operator vehicles and return the matching ones.
          const matchingVehicles = operator.vehicles.filter((vehicle) =>
            get(vehicle, "unique_vehicle_id", "").includes(inputValue)
          );

          if (matchingVehicles.length !== 0) {
            matches.push({...operator, vehicles: matchingVehicles});
          }

          return matches;
        }, []);

  return suggestionIds.length !== 0 ? suggestionIds : [];
};

const enhance = flow(
  observer,
  inject(app("state"))
);

export default enhance(({value = "", onSelect, options = []}) => {
  return (
    <SuggestionInput
      minimumInput={0}
      value={value}
      onSelect={onSelect}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      getSuggestions={getSuggestions(options)}
    />
  );
});
