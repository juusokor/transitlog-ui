import React from "react";
import get from "lodash/get";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {observer} from "mobx-react";
import {sortBy} from "lodash";

const parseLineNumber = (lineId) => {
  // Special case for train lines, they should only show a letter.
  if (/^300[12]/.test(lineId)) {
    return lineId.replace(/\d+/, "");
  }

  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  return lineId.substring(1).replace(/^0+/, "");
};

const getSuggestionValue = (suggestion) =>
  typeof suggestion === "string"
    ? suggestion
    : parseLineNumber(get(suggestion, "lineId", ""));

const renderSuggestion = (suggestion, {query, isHighlighted}) => (
  <SuggestionContent
    isHighlighted={isHighlighted}
    withIcon={true}
    className={getTransportType(suggestion.lineId)}>
    <SuggestionText withIcon={true}>
      {parseLineNumber(suggestion.lineId)}
    </SuggestionText>
  </SuggestionContent>
);

const getSuggestions = (lines) => (value = "") => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  const filteredLines =
    inputLength === 0
      ? lines
      : lines.filter((line) => {
          return parseLineNumber(line.lineId.toLowerCase()).includes(
            inputValue.slice(0, inputLength)
          );
        });

  const sortedLines = sortBy(filteredLines, ({lineId}) => {
    const parsedLineId = parseLineNumber(lineId);
    const numericLineId = parsedLineId.replace(/[^0-9]*/g, "");

    if (!numericLineId) {
      return getTransportType(lineId, true);
    }

    const lineNum = parseInt(numericLineId, 10);
    return getTransportType(lineId, true) + lineNum;
  });

  return sortedLines;
};

@observer
class LineInput extends React.Component {
  componentDidMount() {
    this.ensureLine();
  }

  componentDidUpdate() {
    this.ensureLine();
  }

  onSelectLine = (lineId) => {
    const {lines, onSelect} = this.props;

    // If there is a preset lineId, find the rest of the line data from lines.
    if (lines.length !== 0 && lineId) {
      const lineData = lines.find((l) => parseLineNumber(l.lineId) === lineId);

      if (lineData) {
        onSelect(lineData);
      }
    }
  };

  ensureLine = () => {
    const {line, lines, onSelect} = this.props;

    // If there is a preset lineId, find the rest of the line data from lines.
    if (line.lineId && !line.dateBegin) {
      const lineData = lines.find((l) => l.lineId === line.lineId);

      if (lineData) {
        onSelect(lineData);
      }
    }
  };

  render() {
    const {line, lines} = this.props;

    return (
      <SuggestionInput
        helpText="Select line"
        minimumInput={1}
        value={parseLineNumber(get(line, "lineId", ""))}
        onSelect={this.onSelectLine}
        getValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        getSuggestions={getSuggestions(lines)}
      />
    );
  }
}

export default LineInput;
