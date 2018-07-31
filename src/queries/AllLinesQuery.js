import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import moment from "moment";

const allLinesQuery = gql`
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

const removeFerryFilter = (line) => line.lineId.substring(0, 4) !== "1019";

export default ({children, queryDate}) => (
  <Query query={allLinesQuery}>
    {({loading, error, data}) => {
      if (loading) return "Loading...";
      if (error) return "Error!";

      const queryMoment = moment(queryDate);

      const lines = orderBy(
        get(data, "allLines.nodes", [])
          .filter((node) => node.routes.totalCount !== 0)
          .filter(removeFerryFilter)
          .filter(({dateBegin, dateEnd}) => {
            const beginMoment = moment(dateBegin);
            const endMoment = moment(dateEnd);

            return (
              beginMoment.isBefore(queryMoment) && endMoment.isAfter(queryMoment)
            );
          }),
        "lineId"
      );

      return children({
        loading,
        error,
        lines,
      });
    }}
  </Query>
);
