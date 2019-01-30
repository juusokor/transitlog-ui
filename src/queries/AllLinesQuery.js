import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import {observer} from "mobx-react";
import {isWithinRange} from "../helpers/isWithinRange";

const allLinesQuery = gql`
  query AllLinesQuery {
    allLines {
      nodes {
        lineId
        nameFi
        dateBegin
        dateEnd
        __typename
        routes {
          totalCount
        }
      }
    }
  }
`;

const removeFerryFilter = (line) => line.lineId.substring(0, 4) !== "1019";

export default observer(({children, date}) => (
  <Query query={allLinesQuery}>
    {({loading, error, data}) => {
      const lines = orderBy(
        get(data, "allLines.nodes", [])
          .filter((node) => node.routes.totalCount !== 0)
          .filter(removeFerryFilter)
          .filter(({dateBegin, dateEnd}) => isWithinRange(date, dateBegin, dateEnd)),
        "lineId"
      );

      return children({
        loading,
        error,
        lines,
      });
    }}
  </Query>
));
