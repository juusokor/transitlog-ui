import React, {Component} from "react";
import Autosuggest from "react-autosuggest";
import "./LineInput.css";

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

const getSuggestions = (lines, value) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0
    ? []
    : lines.filter((line) =>
        parseLineNumber(line.lineId.toLowerCase()).includes(
          inputValue.slice(0, inputLength)
        )
      );
};

const getSuggestionValue = (suggestion) => parseLineNumber(suggestion.lineId);

const renderSuggestion = (suggestion) => (
  <span className={"suggestion-content " + getTransportType(suggestion)}>
    <div className={"lineItem"}>{parseLineNumber(suggestion.lineId)}</div>
  </span>
);

export class LineInput extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: getSuggestionValue(this.props.selectedLine),
      suggestions: [],
    };
  }

  onChange = (event, {newValue}) => {
    this.setState({
      value: newValue,
    });
  };

  onSuggestionSelected = (event, {suggestion}) => {
    this.props.onLineSelected(suggestion);
  };

  onSuggestionsFetchRequested = ({value}) => {
    this.setState({
      suggestions: getSuggestions(this.props.lines.lines, value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  render() {
    const {value, suggestions} = this.state;
    const inputProps = {
      placeholder: "Hae linja...",
      value,
      onChange: this.onChange,
    };
    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionSelected={this.onSuggestionSelected}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}
