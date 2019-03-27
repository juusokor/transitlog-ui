import React from "react";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {useSearchOptions} from "../../hooks/useSearchOptions";

const getSuggestionValue = (suggestion) => {
  if (typeof suggestion === "string") {
    return suggestion;
  }

  return get(suggestion, "stopId", "");
};

const renderSuggestion = (suggestion, {query, isHighlighted}) => (
  <SuggestionContent isHighlighted={isHighlighted}>
    <SuggestionText>
      <strong>
        {suggestion.stopId} ({suggestion.shortId.replace(/ /g, "")})
      </strong>
      <br />
      {suggestion.name}
    </SuggestionText>
  </SuggestionContent>
);

export default observer(({stops, onSelect, stop, search}) => {
  const [getSuggestions] = useSearchOptions(search);

  return (
    <SuggestionInput
      helpText="Select stop"
      minimumInput={0}
      value={stop}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      highlightFirstSuggestion={true}
      renderSuggestion={renderSuggestion}
      suggestions={stops.slice(0, 100)}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});
