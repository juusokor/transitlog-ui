import React, {Component} from 'react';
import logo from '../hsl-logo.png';
import './FilterPanel.css'
import gql from "graphql-tag"
import Autosuggest from 'react-autosuggest';
import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";


const parseLineNumber = lineId =>
  // Remove 1st number, which represents the city
  // Remove all zeros from the beginning
  lineId.substring(1).replace(/^0+/, "");

const getTransportType = (line) => {
  if (line.lineId.substring(0, 4) >= 1001 && line.lineId.substring(0, 4) <= 1010) {
    return "tram";
  }
  return "bus";
};

const lineQuery = gql`
  query lineQuery($id: String!, $dateBegin: Date!, $dateEnd: Date!) {
    line: lineByLineIdAndDateBeginAndDateEnd(lineId: $id, dateBegin: $dateBegin, dateEnd: $dateEnd) {
      lineId
      nameFi
      routes {
        nodes {
          routeId
          direction
          dateBegin
          dateEnd
          routeSegments {
            nodes {
              stopIndex
              timingStopType
              duration
              stop: stopByStopId {
                stopId
                lat
                lon
                shortId
                nameFi
                nameSe
              }
            }
          }
          geometries {
            nodes {
              geometry
              dateBegin
              dateEnd
            }
          }
        }
      }
      notes {
        nodes {
          noteType
          noteText
          dateEnd
        }
      }
    }
  }
`;

//mock data
const routes = [
    {
      "shortName": "10",
      "mode": "TRAM"
    },
    {
      "shortName": "582",
      "mode": "BUS"
    },
    {
      "shortName": "164V",
      "mode": "BUS"
    },
    {
      "shortName": "8",
      "mode": "TRAM"
    },
    {
      "shortName": "7",
      "mode": "TRAM"
    },
    {
      "shortName": "6",
      "mode": "TRAM"
    },
    {
      "shortName": "215",
      "mode": "BUS"
    },
    {
      "shortName": "5",
      "mode": "TRAM"
    },
    {
      "shortName": "4",
      "mode": "TRAM"
    },
    {
      "shortName": "214",
      "mode": "BUS"
    },
    {
      "shortName": "M2",
      "mode": "SUBWAY"
    },
    {
      "shortName": "M1",
      "mode": "SUBWAY"
    }
    ]

const getSuggestions = value => {
  const inputValue = value.trim().toLowerCase();
  const inputLength = inputValue.length;

  return inputLength === 0 ? [] : routes.filter(route =>
    route.shortName.toLowerCase().includes(inputValue.slice(0, inputLength))
  );
};

const getSuggestionValue = suggestion => suggestion.shortName;

const renderSuggestion = suggestion => (
  <span className={'suggestion-content ' +suggestion.mode}>
  <div className={"routeItem"}>
    {suggestion.shortName}
  </div>
  </span>
);

export class FilterPanel extends Component {

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
      suggestions: getSuggestions(value)
    });
  }

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  render() {
    const { value, suggestions } = this.state;
    const inputProps = {
      placeholder: 'Hae reitti...',
      value,
      onChange: this.onChange
    };
    return (
      <header className="transitlog-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        <Autosuggest
          suggestions={suggestions}
          onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
          onSuggestionsClearRequested={this.onSuggestionsClearRequested}
          getSuggestionValue={getSuggestionValue}
          renderSuggestion={renderSuggestion}
          inputProps={inputProps}
        />
      </header>
    )
  }


}