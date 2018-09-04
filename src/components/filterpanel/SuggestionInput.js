import React, {Component} from "react";
import Autosuggest from "react-autosuggest";
import "./SuggestionInput.css";
import {observer} from "mobx-react";

@observer
class SuggestionInput extends Component {
  state = {
    suggestions: [],
  };

  onChange = (event, {newValue}) => {
    const {onChange = () => {}} = this.props;
    onChange(newValue.toString());
  };

  onSuggestionSelected = (event, {suggestion}) => {
    this.props.onSelect(suggestion);
  };

  onSuggestionsFetchRequested = ({value}) => {
    const {getSuggestions} = this.props;

    this.setState({
      suggestions: getSuggestions(value),
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: [],
    });
  };

  shouldRenderSuggestions = (limit) => (value) => {
    return value.trim().length >= limit;
  };

  render() {
    const {suggestions} = this.state;
    const {
      value,
      placeholder,
      getValue,
      renderSuggestion,
      minimumInput = 3,
    } = this.props;

    const inputProps = {
      placeholder,
      value,
      onChange: this.onChange,
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        shouldRenderSuggestions={this.shouldRenderSuggestions(minimumInput)}
        onSuggestionSelected={this.onSuggestionSelected}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={getValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    );
  }
}

export default SuggestionInput;
