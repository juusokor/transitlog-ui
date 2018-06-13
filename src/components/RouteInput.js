import React, {Component} from 'react';
import PropTypes from 'prop-types'
import Autosuggest from 'react-autosuggest';
import './RouteInput.css'



const parseLineNumber = lineId =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const getTransportType = (line) => {
  if (line.lineId.substring(0, 4) >= 1001 && line.lineId.substring(0, 4) <= 1010) {
    return "TRAM";
  }
  return "BUS";
};

const getSuggestions = (routes, value) => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : routes.filter(route =>
    parseLineNumber(route.lineId.toLowerCase()).includes(inputValue.slice(0, inputLength))
  );
};

const getSuggestionValue = suggestion => suggestion.lineId;

const renderSuggestion = suggestion => (
  <span className={'suggestion-content ' + getTransportType(suggestion)}>
  <div className={"routeItem"}>
    {parseLineNumber(suggestion.lineId)}
  </div>
  </span>
);


export class RouteInput extends Component {
   constructor() {
    super();
    this.state = {
      value: '',
      suggestions: []
    }
  }

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: getSuggestions(this.props.routes.lines, value)
    });
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };
  
  render() {
    const {value, suggestions} = this.state
    const inputProps = {
      placeholder: 'Hae reitti...',
      value,
      onChange: this.onChange
    }
    return (
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
    )
  }

}

RouteInput.PropTypes = {
    routes: PropTypes.func.isRequired
}