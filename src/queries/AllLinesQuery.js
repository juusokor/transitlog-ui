import React from "react";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";
import {observer} from "mobx-react";
import {filterLines} from "../helpers/filterJoreCollections";

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
      let lines = orderBy(
        get(data, "allLines.nodes", [])
          .filter((node) => node.routes.totalCount !== 0)
          .filter(removeFerryFilter),
        "lineId"
      );

      lines = filterLines(lines, date);

      return children({
        loading,
        error,
        lines,
      });
    }}
  </Query>
));
