import React, {Component} from 'react';
import logo from '../hsl-logo.png';
import './FilterPanel.css';
import {RouteInput} from './RouteInput';
import gql from "graphql-tag";
import {Query} from 'react-apollo';
import {DateInput} from './DateInput';
import "moment";
import "moment/locale/fi";

const routeQuery = gql`
  query AllLinesQuery {
    allLines {
      nodes {
        lineId
        nameFi
        dateBegin
        dateEnd
        routes {
          totalCount
        }
      }
    }
  }
`;

const jorneyStartTimeQuery = gql`
  query Alldepartures($routeId: String!, $stopId: String!, $direction: String!, $dayType: String!) {
    allDepartures(condition: {routeId: $routeId, stopId: $stopId, direction: $direction, dayType: $dayType}) {
      nodes {
        direction
        dayType
        dateBegin
        dateEnd
        stopId
        departureId
        arrivalHours
        arrivalMinutes
      }
    }
  }
`;

const removeTrainsFilter = line => line.lineId.substring(0, 1) !== "3";
const removeFerryFilter = line => line.lineId.substring(0, 4) !== "1019";

const transportTypeOrder = ["tram", "bus"];
const linesSorter = (a, b) => {
    if (a.transportType !== b.transportType) {
        return transportTypeOrder.indexOf(a.transportType) >
                transportTypeOrder.indexOf(b.transportType) ? 1 : -1;
    } else if (a.lineId.substring(1, 4) !== b.lineId.substring(1, 4)) {
        return a.lineId.substring(1, 4) > b.lineId.substring(1, 4) ? 1 : -1;
    } else if (a.lineId.substring(0, 1) !== b.lineId.substring(0, 1)) {
        return a.lineId.substring(0, 1) > b.lineId.substring(0, 1) ? 1 : -1;
    }
    return a.lineId.substring(4, 6) > b.lineId.substring(4, 6) ? 1 : -1;
};


export class FilterPanel extends Component {

  render() {
    return (
      <header className="transitlog-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        <DateInput locale={"fi"}/>
        <Query query={routeQuery}>
          {({ loading, error, data }) => {
          if (loading) return <div className="graphqlLoad">Loading...</div>;
          if (error) return <div>Error!</div>;
          return (<RouteInput selectedRoute={this.props.selectedRoute} onRouteSelected={this.props.onRouteSelected} routes={{
               lines: data.allLines.nodes
                 .filter(node => node.routes.totalCount !== 0)
                 .filter(removeTrainsFilter)
                 .filter(removeFerryFilter)
                 .sort(linesSorter),
              }}/>)
          }}
        </Query>
        <input value={'suunta'}/>
        <Query query={jorneyStartTimeQuery} variables={{routeId: this.props.selectedRoute.lineId, stopId: "1040446", direction: this.props.selectedRoute.direction, dayType: "Ma"}}>
          {({ loading, error, data }) => {
              console.log('jorney', loading, error, data);
              if (loading) return <div>Loading...</div>;
              if (error) return <div>Error!</div>;
              return (<input value={'lähdöt'}/>)
          }}
        </Query>
        
      </header>
    )
  }
}
