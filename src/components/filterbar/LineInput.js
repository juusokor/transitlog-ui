import React from "react";
import get from "lodash/get";
import SuggestionInput from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";

const parseLineNumber = (lineId) =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const getSuggestionValue = (suggestion) =>
  parseLineNumber(get(suggestion, "lineId", ""));

const renderSuggestion = (suggestion) => (
  <span className={`suggestion-content ${getTransportType(suggestion.lineId)}`}>
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

@inject(app("state"))
@observer
class LineInput extends React.Component {
  componentDidMount() {
    this.ensureLine();
  }

  componentDidUpdate() {
    this.ensureLine();
  }

  ensureLine = () => {
    const {
      state: {line},
      lines,
      onSelect,
    } = this.props;

    // If there is a preset lineId, find the rest of the line data from lines.
    if (line.lineId && !line.dateBegin) {
      const lineData = lines.find((l) => l.lineId === line.lineId);

      if (lineData) {
        onSelect(lineData);
      }
    }
  };

  render() {
    const {
      state: {line},
      lines,
      onSelect,
    } = this.props;

    return (
      <SuggestionInput
        minimumInput={1}
        value={line}
        onSelect={onSelect}
        getValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        getSuggestions={getSuggestions(lines)}
      />
    );
  }
}

export default LineInput;
