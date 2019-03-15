import React, {useCallback} from "react";
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
      inService={
        typeof suggestion.inService === "undefined" || suggestion.inService === true
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

const enhance = flow(
  observer,
  inject("state")
);

export default enhance(({value = "", onSelect, onInputChange, options = []}) => {
  const getSuggestions = useCallback((value) => onInputChange(value), [
    onInputChange,
  ]);

  return (
    <SuggestionInput
      helpText="Select vehicle"
      minimumInput={0}
      value={value}
      onSelect={onSelect}
      onInputChange={onInputChange}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      getSuggestions={getSuggestions}
      suggestions={options}
    />
  );
});
