import React from "react";
import styled from "styled-components";
import withSelectedJourney from "../../../hoc/withSelectedJourney";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import Equipment from "./Equipment";
import {observer, inject, Observer} from "mobx-react";
import {app} from "mobx-app";
import withRoute from "../../../hoc/withRoute";
import pick from "lodash/pick";
import get from "lodash/get";
import SingleRouteQuery from "../../../queries/SingleRouteQuery";
import JourneyStops from "./JourneyStops";
import Loading from "../../Loading";
import JourneyInfo from "./JourneyInfo";

const JourneyPanelContent = styled.div`
  padding: 2rem 0 1rem;
  overflow-y: auto;
  overflow-x: visible;
`;

@withRoute
@withSelectedJourney
@inject(app("state"))
@observer
class JourneyDetails extends React.Component {
  render() {
    const {
      state: {date, route: stateRoute},
      selectedJourneyHfp,
    } = this.props;
    const firstPosition = selectedJourneyHfp[0];

    if (!firstPosition || !stateRoute || !stateRoute.routeId) {
      return "Loading...";
    }

    return (
      <SingleRouteQuery
        date={date}
        route={pick(stateRoute, "routeId", "direction", "dateBegin", "dateEnd")}>
        {({route, loading, error}) => {
          if (loading || error) {
            return (
              <div>
                <Loading />
              </div>
            );
          }

          return (
            <>
              <JourneyDetailsHeader
                date={date}
                time={firstPosition.journey_start_time}
                mode={get(route, "mode", "BUS")}
                routeId={get(route, "routeId", "")}
                desi={get(firstPosition, "desi")}
                name={get(route, "nameFi")}
              />
              <JourneyInfo journey={firstPosition} />
              <JourneyPanelContent>
                <JourneyStops
                  journeyHfp={selectedJourneyHfp}
                  date={date}
                  route={route}
                />
                <Equipment
                  observedVehicleId={get(firstPosition, "unique_vehicle_id", "")}
                />
              </JourneyPanelContent>
            </>
          );
        }}
      </SingleRouteQuery>
    );
  }
}
export default JourneyDetails;
