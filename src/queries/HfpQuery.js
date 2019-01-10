import React from "react";
import get from "lodash/get";
import gql from "graphql-tag";
import HfpFieldsFragment from "./HfpFieldsFragment";
import getJourneyId from "../helpers/getJourneyId";
import {Query} from "react-apollo";
import {groupHfpPositions} from "../helpers/groupHfpPositions";
import {createHfpItem} from "../helpers/createHfpItem";
import {observer} from "mobx-react";

export const hfpQuery = gql`
  query hfpQuery($route_id: String, $direction: smallint, $date: date) {
    vehicles(
      order_by: {received_at: asc}
      where: {
        route_id: {_eq: $route_id}
        direction_id: {_eq: $direction}
        oday: {_eq: $date}
      }
    ) {
      ...HfpFieldsFragment
    }
  }
  ${HfpFieldsFragment}
`;

@observer
class HfpQuery extends React.Component {
  prevResult = [];

  render() {
    const {children, route, date} = this.props;
    const {routeId, direction} = route;

    return (
      <Query
        query={hfpQuery}
        variables={{
          route_id: routeId,
          direction: parseInt(direction, 10),
          date,
        }}>
        {({data, error, loading}) => {
          if (!data || loading) {
            return children({journeys: this.prevResult, loading, error});
          }

          const vehicles = get(data, "vehicles", []);

          const groupedJourneys = groupHfpPositions(
            vehicles
              // TODO: Change this when we have to deal with null positions
              .filter((pos) => !!pos && !!pos.lat && !!pos.long)
              .map(createHfpItem),
            getJourneyId,
            "journeyId"
            // Make sure all returned journeys were requested
          );

          this.prevResult = groupedJourneys;
          return children({journeys: groupedJourneys, loading, error});
        }}
      </Query>
    );
  }
}

export default HfpQuery;
