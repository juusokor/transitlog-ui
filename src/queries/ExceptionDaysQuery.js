import React from "react";
import {observer} from "mobx-react-lite";
import {inject} from "../helpers/inject";
import flow from "lodash/flow";
import get from "lodash/get";
import gql from "graphql-tag";
import {Query} from "react-apollo";

const exceptionDaysQuery = gql`
  query exceptionDays($year: String!) {
    exceptionDays(year: $year) {
      id
      exceptionDate
      newDayType
      dayType
      modeScope
      description
      exclusive
      startTime
      endTime
    }
  }
`;

const decorate = flow(
  observer,
  inject("state")
);

const ExceptionDaysQuery = decorate(({state, children}) => {
  const year = state.date.slice(0, 4);
  console.log(year);

  return (
    <Query
      query={exceptionDaysQuery}
      variables={{
        year,
      }}>
      {({data, loading}) => {
        const exceptionDays = get(data, "exceptionDays", []);
        return children({exceptionDays, loading});
      }}
    </Query>
  );
});

export default ExceptionDaysQuery;
