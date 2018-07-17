import React, {Component} from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {joreClient, digiTClient, hfpClient} from "../api";

const routesByLineQuery = gql`
  query lineQuery($lineId: String!, $dateBegin: Date!, $dateEnd: Date!) {
    line: lineByLineIdAndDateBeginAndDateEnd(
      lineId: $lineId
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      routes {
        nodes {
          routeId
          direction
          dateBegin
          dateEnd
          destinationFi
          originFi
          nameFi
        }
      }
    }
  }
`;

export default ({filter, children}) => {
  console.log(filter, children);
  if (filter.type === "line") {
    return (
      <Query client={joreClient} query={routesByLineQuery} variables={filter}>
        {({loading, error, data}) =>
          children({
            loading,
            error,
            data: data && data.line ? data.line.routes.nodes : data,
          })
        }
      </Query>
    );
  } else {
    return children({
      loading: false,
      error: new Error("unknown filter type"),
      data: null,
    });
  }
};
