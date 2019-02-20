import React from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionSectionTitle,
} from "./SuggestionInput";
import flow from "lodash/flow";
import get from "lodash/get";
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
      inService={!!suggestion.inServiceOnDate}>
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

function matchVehicleTerms(vehicles, term) {
  let matches = [];

  // Search operator vehicles and return the matching ones.
  const matchingVehicles = vehicles.filter((vehicle) =>
    (vehicle.vehicleId + vehicle.operatorId + vehicle.registryNr)
      .toLowerCase()
      .includes(term)
  );

  if (matchingVehicles.length !== 0) {
    matches = matchingVehicles;
  }

  return matches;
}

function escapeRegexCharacters(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const getSuggestions = (operators) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputWords = (inputValue.match(/\w+/g) || [""])
    .map(escapeRegexCharacters)
    .filter((w) => !!w);

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
              const testStr = `${operatorName} ${operatorId} ${registryNr} ${vehicleId}`;

              return inputWords.every((inputWord) => {
                const regex = new RegExp(inputWord, "gi");
                return regex.test(testStr);
              });
            }),
          };
        })
        .filter((operator) => operator.vehicles.length > 0);
};

const enhance = flow(
  observer,
  inject("state")
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
