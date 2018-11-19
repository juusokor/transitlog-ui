import React, {Component} from "react";
import PropTypes from "prop-types";
import {observer} from "mobx-react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";
import doubleDigit from "../helpers/doubleDigit";

const firstDepartureQuery = gql`
  query allDepartures(
    $routeId: String
    $direction: String
    $dayType: String
    $dateBegin: Date
    $dateEnd: Date
    $departureId: Int
  ) {
    allDepartures(
      first: 1
      orderBy: [HOURS_ASC, MINUTES_ASC, DEPARTURE_ID_ASC]
      condition: {
        routeId: $routeId
        direction: $direction
        dateBegin: $dateBegin
        dateEnd: $dateEnd
        departureId: $departureId
        dayType: $dayType
      }
    ) {
      nodes {
        hours
        minutes
        departureId
      }
    }
  }
`;

@observer
class FirstDepartureQuery extends Component {
  static propTypes = {
    routeId: PropTypes.string.isRequired,
    direction: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    dayType: PropTypes.string.isRequired,
    departureId: PropTypes.number.isRequired,
    dateBegin: PropTypes.string.isRequired,
    dateEnd: PropTypes.string.isRequired,
  };

  render() {
    const {
      routeId,
      direction,
      dayType,
      dateBegin,
      dateEnd,
      departureId,
      children,
      skip,
    } = this.props;

    const queryVars = {
      departureId,
      routeId,
      direction,
      dayType,
      dateBegin,
      dateEnd,
    };

    return (
      <Query skip={skip} query={firstDepartureQuery} variables={queryVars}>
        {({loading, error, data}) => {
          if (loading || error) {
            return children({departureTime: "", loading, error});
          }

          const departure = get(data, "allDepartures.nodes[0]", "");

          if (!departure) {
            return children({departureTime: "", loading: false, error: null});
          }

          const startTime = `${doubleDigit(departure.hours)}:${doubleDigit(
            departure.minutes
          )}:00`;

          return children({departureTime: startTime, loading: false, error: null});
        }}
      </Query>
    );
  }
}

export default FirstDepartureQuery;
