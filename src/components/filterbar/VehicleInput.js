import React, {useMemo} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionSectionTitle,
} from "./SuggestionInput";
import flow from "lodash/flow";
import get from "lodash/get";
import words from "lodash/words";
import {observer} from "mobx-react-lite";
import styled from "styled-components";
import {inject} from "../../helpers/inject";

const VehicleSuggestion = styled(SuggestionContent)`
  background: ${({inService = true, isHighlighted = false}) =>
    isHighlighted ? "var(--blue)" : inService ? "white" : "var(--light-pink)"};
`;

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  const vehicleId = get(suggestion, "vehicleId", "");
  const operatorId = parseInt(get(suggestion, "operatorId", ""), 10);
  return !vehicleId ? "" : `${operatorId}/${vehicleId}`;
};

const renderSuggestion = (suggestion, {query, isHighlighted}) => {
  const registryNr = get(suggestion, "registryNr", "");
  let uniqueVehicleId = getSuggestionValue(suggestion);

  if (registryNr) {
    uniqueVehicleId = `${uniqueVehicleId} (${registryNr})`;
  }

  return (
    <VehicleSuggestion
      isHighlighted={isHighlighted}
      inService={
        typeof suggestion.inServiceOnDate === "undefined" ||
        suggestion.inServiceOnDate === true
      }>
      <SuggestionText>{uniqueVehicleId}</SuggestionText>
    </VehicleSuggestion>
  );
};

const renderSectionTitle = (section) => (
  <SuggestionSectionTitle>
    {section.operatorName} ({section.operatorId})
  </SuggestionSectionTitle>
);

const getSectionSuggestions = (section) => section.vehicles;

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const matchSuggestions = (operators, value = "") => {
  const inputValue = escapeRegexCharacters(value.trim().toLowerCase());
  const inputWords = words(inputValue, /[^\s]+/g).filter((w) => !!w);

  if (inputWords.length === 0) {
    return operators;
  }

  return operators.length === 0
    ? operators
    : operators
        .map(({operatorName, operatorId, vehicles}) => {
          return {
            operatorName,
            operatorId,
            vehicles: vehicles.filter(({registryNr, vehicleId}) => {
              const testStr = `${operatorName} ${operatorId} ${vehicleId} ${registryNr} ${operatorId}/${vehicleId}`
                .trim()
                .toLowerCase();

              return inputWords.every((inputWord) => {
                const regex = new RegExp(inputWord, "gi");
                return regex.test(testStr);
              });
            }),
          };
        })
        .filter((operator) => operator.vehicles.length > 0);
};

const getSuggestions = (operators) => (value) => matchSuggestions(operators, value);

const enhance = flow(
  observer,
  inject("state")
);

export default enhance(({value = "", onSelect, options = []}) => {
  const suggestions = useMemo(() => getSuggestions(options), [options]);

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
      getSuggestions={suggestions}
    />
  );
});
