import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "./withRoute";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {get} from "lodash";
import getDay from "date-fns/get_day";
import parse from "date-fns/parse";
import isWithinRange from "date-fns/is_within_range";

const departuresQuery = gql`
  query routeDepartures(
    $routeId: String
    $direction: String
    $dayType: String
    $stopId: String
  ) {
    allDepartures(
      condition: {
        routeId: $routeId
        direction: $direction
        stopId: $stopId
        dayType: $dayType
      }
    ) {
      nodes {
        stopId
        dayType
        hours
        minutes
        dateBegin
        dateEnd
      }
    }
  }
`;

const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithDeparturesComponent extends React.Component {
    render() {
      const {
        route: {routeId, direction, dateBegin, dateEnd, originstopId},
        state: {date},
      } = this.props;

      const requiredVars = [
        date,
        routeId,
        direction,
        dateBegin,
        dateEnd,
        originstopId,
      ];

      // Make sure none of these are falsy
      if (requiredVars.some((i) => !i)) {
        console.log(requiredVars);
        return <Component departures={[]} {...this.props} />;
      }

      const queryDayType = dayTypes[getDay(date)];

      return (
        <Query
          query={departuresQuery}
          variables={{
            routeId,
            direction,
            dayType: queryDayType,
            stopId: originstopId,
          }}>
          {({loading, error, data}) => {
            const departures = get(data, "allDepartures.nodes", []).filter(
              ({dateBegin, dateEnd}) => {
                const begin = parse(dateBegin);
                const end = parse(dateEnd);

                return isWithinRange(date, begin, end);
              }
            );

            return <Component departures={departures} {...this.props} />;
          }}
        </Query>
      );
    }
  }

  return WithDeparturesComponent;
};
