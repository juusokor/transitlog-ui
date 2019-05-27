import React, {useMemo, useState, useCallback} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionAlerts,
} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {useSearch} from "../../hooks/useSearch";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";
import styled from "styled-components";
import Loading from "../Loading";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "stopId", "");
};

const renderSuggestion = (date) => (suggestion, {query, isHighlighted}) => {
  const suggestionAlerts = getAlertsInEffect(suggestion, date);

  return (
    <SuggestionContent isHighlighted={isHighlighted}>
      <SuggestionText>
        <strong>
          {suggestion.stopId} ({suggestion.shortId.replace(/ /g, "")})
        </strong>
        <br />
        {suggestion.name}
      </SuggestionText>
      {suggestionAlerts.length !== 0 && (
        <SuggestionAlerts alerts={getAlertsInEffect(suggestion, date)} />
      )}
    </SuggestionContent>
  );
};

const renderSuggestionsContainer = (loading) => ({containerProps, children, query}) => {
  return (
    <div {...containerProps}>{loading ? <LoadingSpinner inline={true} /> : children}</div>
  );
};

export default observer(({date, stops, onSelect, stop, loading}) => {
  const [options, setOptions] = useState(stops);

  const doSearch = useSearch(stops, [
    {name: "shortId", weight: 0.7},
    {name: "name", weight: 0.1},
    {name: "stopId", weight: 0.2},
  ]);
  const renderSuggestionFn = useMemo(() => renderSuggestion(date), [date]);

  const onSearch = useCallback(
    (searchQuery) => {
      const result = doSearch(searchQuery);
      setOptions(result);
    },
    [doSearch]
  );

  return (
    <SuggestionInput
      helpText="Select stop"
      minimumInput={0}
      value={stop}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      highlightFirstSuggestion={true}
      renderSuggestion={renderSuggestionFn}
      suggestions={options.slice(0, 50)}
      renderSuggestionsContainer={renderSuggestionsContainer(loading)}
      onSuggestionsFetchRequested={onSearch}
    />
  );
});
