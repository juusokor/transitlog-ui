import React from "react";
import SuggestionInput from "./SuggestionInput";
import fuzzySearch from "../../helpers/fuzzySearch";

const getSuggestionValue = (suggestion) =>
  suggestion.stopId ? `${suggestion.stopId} (${suggestion.shortId})` : "";

const renderSuggestion = (suggestion) => (
  <span className="suggestion-content">
    <div className="suggestion-text">{getSuggestionValue(suggestion)}</div>
  </span>
);

const getSuggestions = (stops) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? stops.slice(0, 20)
    : stops.filter((item) =>
        fuzzySearch(inputValue, `${item.stopId} ${item.shortId}`)
      );
};

export default ({stops, onSelect, stop}) => {
  return (
    <SuggestionInput
      minimumInput={0}
      placeholder="Hae pysäkkiä..."
      value={getSuggestionValue(stop)}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      getSuggestions={getSuggestions(stops)}
    />
  );
};
