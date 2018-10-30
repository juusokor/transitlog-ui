import {observer} from "mobx-react";
import React from "react";
import get from "lodash/get";
import doubleDigit from "../helpers/doubleDigit";
import DeparturesQuery from "./DeparturesQuery";
import StopHfpQuery from "./StopHfpQuery";

@observer
class DepartureJourneyQuery extends React.Component {
  render() {
    const {onCompleted, date, departure, children} = this.props;
    const {departureId, dateBegin, dateEnd, routeId, direction, stopId} = departure;

    return (
      <DeparturesQuery
        departureId={departureId}
        limit={1}
        dateBegin={dateBegin}
        dateEnd={dateEnd}
        route={{routeId, direction}}
        date={date}>
        {({departures}) => {
          if (departures.length === 0) {
            return children({journey: null, departure: null});
          }

          const departure = get(departures, "[0]", null);

          const {hours, minutes} = departure || {};
          const startTime = `${doubleDigit(hours)}:${doubleDigit(minutes)}:00`;

          return (
            <StopHfpQuery
              onCompleted={onCompleted}
              routeId={routeId}
              date={date}
              direction={direction}
              stopId={stopId}
              startTime={startTime}>
              {({journey}) => children({journey, departure})}
            </StopHfpQuery>
          );
        }}
      </DeparturesQuery>
    );
  }
}

export default DepartureJourneyQuery;
