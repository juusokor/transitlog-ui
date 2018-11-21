import React from "react";
import SuggestionInput from "./SuggestionInput";
import orderBy from "lodash/orderBy";
import get from "lodash/get";
import {observer} from "mobx-react";

const getSuggestionValue = (suggestion) =>
  get(suggestion, "stopId", "")
    ? `${suggestion.shortId.replace(/ /g, "")} - ${suggestion.nameFi} (${
        suggestion.stopId
      })`
    : "";

const renderSuggestion = (suggestion) => (
  <span className="suggestion-content">
    <div className="suggestion-text">{getSuggestionValue(suggestion)}</div>
  </span>
);

const suggestionFitness = (inputValue) => (stop) => {
  if (stop.shortId.slice(2).startsWith(inputValue)) return 3;
  if (stop.shortId.toLowerCase().startsWith(inputValue)) return 2;
  if (
    stop.stopId.startsWith(inputValue) ||
    stop.nameFi.toLowerCase().startsWith(inputValue)
  )
    return 1;

  return 0;
};

const getSuggestions = (stops = []) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  const suggestionStops =
    inputLength === 0 || stops.length === 0
      ? stops
      : stops.filter((item) =>
          getSuggestionValue(item)
            .trim()
            .toLowerCase()
            .includes(inputValue)
        );

  return orderBy(
    suggestionStops,
    [inputLength ? suggestionFitness(inputValue) : () => 0, "stopId"],
    ["desc", "asc"]
  ).slice(0, 50);
};

export default observer(({stops, onSelect, stop}) => {
  return (
    <SuggestionInput
      minimumInput={0}
      value={stop}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      renderSuggestion={renderSuggestion}
      getSuggestions={getSuggestions(stops)}
    />
  );
});
