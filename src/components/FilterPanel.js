import React, {Component} from 'react';
import logo from '../hsl-logo.png';


import gql from "graphql-tag"
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

export class FilterPanel extends Component {

  constructor() {
    super()
  }


  render() {
    return (
      <header className="transitlog-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
      </header>
    )
  }


}