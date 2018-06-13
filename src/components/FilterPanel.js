import React, {Component} from 'react';
import logo from '../hsl-logo.png';
import './FilterPanel.css'
import {RouteInput} from './RouteInput'
import gql from "graphql-tag"
import graphql, {Query} from 'react-apollo'

import sortBy from "lodash/sortBy";
import uniq from "lodash/uniq";

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


export class FilterPanel extends Component {
  
  render() {
    return (
      <header className="transitlog-header">
        <img src={logo} className="App-logo" alt="logo"/>
        <h1 className="App-title">Liikenteenvalvontatyökalu</h1>
        <Query query={routeQuery}>
          {({ loading, error, data }) => {
          if (loading) return <div>Loading...</div>;
          if (error) return <div>Error!</div>;
          return (<RouteInput routes={{
               lines: data.allLines.nodes
                 .filter(node => node.routes.totalCount !== 0),
              }}/>)
          }}
        </Query>
       
      </header>
    )
  }

}
