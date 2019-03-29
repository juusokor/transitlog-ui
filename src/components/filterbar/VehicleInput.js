import React, {useMemo} from "react";
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
import orderBy from "lodash/orderBy";
import map from "lodash/map";
import groupBy from "lodash/groupBy";
import {useSearchOptions} from "../../hooks/useSearchOptions";

const VehicleSuggestion = styled(SuggestionContent)`
  color: ${({inService = true, isHighlighted = false}) =>
    isHighlighted ? "white" : inService ? "var(--dark-grey)" : "var(--light-grey)"};
`;

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "id", "");
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
  <SuggestionSectionTitle>{section.operator}</SuggestionSectionTitle>
);

const getSectionSuggestions = (section) => section.vehicles;

const getVehicleGroups = (vehicles = [], sortByMatchScore = false) => {
  const sortVehiclesBy = sortByMatchScore ? "_matchScore" : "vehicleId";
  const sortGroupsBy = sortByMatchScore
    ? "combinedMatchScore"
    : ({operator}) => /\(([^)]+)\)/.exec(operator);

  const sortDirection = sortByMatchScore ? "desc" : "asc";

  return orderBy(
    map(
      groupBy(
        vehicles,
        ({operatorName, operatorId}) => `${operatorName} (${operatorId})`
      ),
      (vehicles, groupLabel) => ({
        operator: groupLabel,
        combinedMatchScore: sortByMatchScore
          ? vehicles.reduce((score, {_matchScore = 0}) => score + _matchScore, 0)
          : 0,
        vehicles: orderBy(vehicles, sortVehiclesBy, sortDirection).slice(0, 50),
      })
    ),
    sortGroupsBy,
    sortDirection
  ).slice(0, 5);
};

const enhance = flow(
  observer,
  inject("state")
);

export default enhance(({value = "", onSelect, search, options = []}) => {
  const [getSuggestions, searchActive] = useSearchOptions(search);

  const vehicleOptions = useMemo(() => getVehicleGroups(options, searchActive), [
    options,
  ]);

  return (
    <SuggestionInput
      helpText="Select vehicle"
      minimumInput={0}
      value={value}
      onSelect={onSelect}
      multiSection={true}
      renderSectionTitle={renderSectionTitle}
      getSectionSuggestions={getSectionSuggestions}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      suggestions={vehicleOptions}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});
