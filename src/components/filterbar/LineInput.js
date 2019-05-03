import React, {useState, useCallback} from "react";
import get from "lodash/get";
import SuggestionInput, {SuggestionContent, SuggestionText} from "./SuggestionInput";
import getTransportType from "../../helpers/getTransportType";
import {observer} from "mobx-react-lite";
import sortBy from "lodash/sortBy";
import {parseLineNumber} from "../../helpers/parseLineNumber";

const getSuggestionValue = (suggestion) => get(suggestion, "lineId", suggestion);

const renderSuggestion = (suggestion, {isHighlighted}) => {
  const lineId = get(suggestion, "lineId", suggestion);

  return (
    <SuggestionContent
      isHighlighted={isHighlighted}
      withIcon={true}
      className={getTransportType(lineId)}>
      <SuggestionText withIcon={true}>{parseLineNumber(lineId)}</SuggestionText>
    </SuggestionContent>
  );
};

const getFilteredSuggestions = (lines, {value = ""}) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  const filteredLines =
    inputLength === 0
      ? lines
      : lines.filter((line) => {
          return line.lineId.toLowerCase().includes(inputValue.slice(0, inputLength));
        });

  return sortBy(filteredLines, ({lineId}) => {
    const parsedLineId = parseLineNumber(lineId);
    const numericLineId = parsedLineId.replace(/[^0-9]*/g, "");

    if (!numericLineId) {
      return getTransportType(lineId, true);
    }

    const lineNum = parseInt(numericLineId, 10);
    return getTransportType(lineId, true) + lineNum;
  });
};

const LineInput = observer(({line, lines, onSelect}) => {
  const [options, setOptions] = useState([]);

  const getSuggestions = useCallback(
    (value) => {
      const nextOptions = getFilteredSuggestions(lines, value);
      setOptions(nextOptions);
    },
    [lines]
  );

  return (
    <SuggestionInput
      helpText="Select line"
      minimumInput={1}
      value={line}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      getDisplayValue={parseLineNumber}
      renderSuggestion={renderSuggestion}
      suggestions={options}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});

export default LineInput;
