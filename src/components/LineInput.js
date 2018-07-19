import React from "react";
import get from "lodash/get";
import SuggestionInput from "./SuggestionInput";

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const getTransportType = (line) => {
  if (line.lineId.substring(0, 4) >= 1001 && line.lineId.substring(0, 4) <= 1010) {
    return "TRAM";
  }
  return "BUS";
};

const getSuggestionValue = (suggestion) =>
  parseLineNumber(get(suggestion, "lineId", ""));

const renderSuggestion = (suggestion) => (
  <span className={`suggestion-content ${getTransportType(suggestion)}`}>
    <div className="suggestion-text with-icon">
      {parseLineNumber(suggestion.lineId)}
    </div>
  </span>
);

const getSuggestions = (lines) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? lines
    : lines.filter((line) =>
        parseLineNumber(line.lineId.toLowerCase()).includes(
          inputValue.slice(0, inputLength)
        )
      );
};

export default ({lines, line, onSelect}) => (
  <SuggestionInput
    minimumInput={1}
    placeholder="Hae linjaa..."
    value={getSuggestionValue(line)}
    onSelect={onSelect}
    getValue={getSuggestionValue}
    renderSuggestion={renderSuggestion}
    getSuggestions={getSuggestions(lines)}
  />
);
