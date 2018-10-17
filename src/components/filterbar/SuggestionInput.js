import React, {Component} from "react";
import Autosuggest from "react-autosuggest";
import autosuggestStyles from "./SuggestionInput.css";
import {observer} from "mobx-react";
import styled from "styled-components";
import {InputStyles} from "../Forms";

const AutosuggestWrapper = styled.div`
  width: 100%;
  ${autosuggestStyles};

  .react-autosuggest__input {
    ${InputStyles};
  }
`;

@observer
class SuggestionInput extends Component {
  static getDerivedStateFromProps({value}, {value: currentValue, _lastValue}) {
    if (value && value !== currentValue && value !== _lastValue) {
      return {
        value,
        isEmpty: !value,
      };
    }

    if (value !== _lastValue) {
      return {
        _lastValue: value,
      };
    }

    return null;
  }

  state = {
    isEmpty: !this.props.value,
    _lastValue: this.props.value.toString(),
    value: this.props.value.toString(),
    suggestions: [],
  };

  onChange = (event, {newValue}) => {
    const value = newValue.toString();

    if (!value) {
      this.props.onSelect("");
    }

    this.setState({
      value,
      isEmpty: !value,
    });
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
    const {suggestions, value, isEmpty} = this.state;
    const {
      className,
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
      <AutosuggestWrapper
        className={`${className} ${isEmpty ? "empty-select" : ""}`}>
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
      </AutosuggestWrapper>
    );
  }
}

export default SuggestionInput;
