import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import React from "react";
import withRoute from "./withRoute";
import gql from "graphql-tag";
import {Query} from "react-apollo";
import {get, compact} from "lodash";

const departuresQuery = gql`
  query routeDepartures(
    $routeId: String!
    $direction: String!
    $dateBegin: Date!
    $dateEnd: Date!
    $queryDate: Date
  ) {
    route: routeByRouteIdAndDirectionAndDateBeginAndDateEnd(
      routeId: $routeId
      direction: $direction
      dateBegin: $dateBegin
      dateEnd: $dateEnd
    ) {
      nodeId
      routeId
      # sic
      departuresGropuped(date: $queryDate) {
        nodes {
          dayType
          hours
          minutes
          dateBegin
          dateEnd
        }
      }
    }
  }
`;

export default (Component) => {
  @inject(app("state"))
  @withRoute
  @observer
  class WithDeparturesComponent extends React.Component {
    render() {
      const {
        route: {routeId, direction, dateBegin, dateEnd},
        state: {date},
      } = this.props;

      console.log(date, this.props.route);

      // Make sure none if these are falsy
      if ([date, routeId, direction, dateBegin, dateEnd].some((i) => !i)) {
        return <Component departures={[]} {...this.props} />;
      }

      return (
        <Query
          query={departuresQuery}
          variables={{
            routeId,
            direction,
            dateBegin,
            dateEnd,
            queryDate: date,
          }}>
          {({loading, error, data}) => {
            const departures = get(data, "route.departuresGropuped.nodes", []); // sic

            console.log(departures);

            return <Component departures={departures} {...this.props} />;
          }}
        </Query>
      );
    }
  }

  return WithDeparturesComponent;
};
