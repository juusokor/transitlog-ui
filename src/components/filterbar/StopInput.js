import React, {useMemo} from "react";
import SuggestionInput, {
  SuggestionContent,
  SuggestionText,
  SuggestionAlerts,
} from "./SuggestionInput";
import get from "lodash/get";
import {observer} from "mobx-react-lite";
import {useSearchOptions} from "../../hooks/useSearchOptions";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";

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

export default observer(({date, stops, onSelect, stop, search}) => {
  const [getSuggestions] = useSearchOptions(search);
  const renderSuggestionFn = useMemo(() => renderSuggestion(date), [date]);

  return (
    <SuggestionInput
      helpText="Select stop"
      minimumInput={0}
      value={stop}
      onSelect={onSelect}
      getValue={getSuggestionValue}
      highlightFirstSuggestion={true}
      renderSuggestion={renderSuggestionFn}
      suggestions={stops}
      onSuggestionsFetchRequested={getSuggestions}
    />
  );
});
