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

  const sortedLines = sortBy(lines, ({lineId}) => {
    const parsedLine = parseLineNumber(lineId);
    // Convert a letter line id to a number, so that a => 1, b => 2 etc.
    const lineNum = isNaN(parseInt(parsedLine, 10))
      ? parsedLine.charCodeAt(0) - 97
      : parsedLine;

    return getTransportType(lineId, true) + lineNum;
  });

  return inputLength === 0
    ? sortedLines
    : sortedLines.filter((line) => {
        return parseLineNumber(line.lineId.toLowerCase()).includes(
          inputValue.slice(0, inputLength)
        );
      });
};

@observer
class LineInput extends React.Component {
  componentDidMount() {
    this.ensureLine();
  }

  componentDidUpdate() {
    this.ensureLine();
  }

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
    const {line, lines, onSelect} = this.props;
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
