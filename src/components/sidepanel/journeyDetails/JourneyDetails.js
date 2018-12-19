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

const JourneyPanelContent = styled.div`
  padding: 2rem 0 1rem;
  overflow-y: auto;
  overflow-x: visible;
`;

const JourneyInfo = styled.div`
  margin-top: 1rem;
`;

const JourneyInfoRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2rem;
  background: var(--lightest-grey);
  font-size: 1rem;
  font-family: inherit;

  &:nth-child(even) {
    background: rgba(0, 0, 0, 0.01);
  }
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
              <JourneyInfo>
                <JourneyInfoRow>
                  <span>Terminal time</span>
                  <strong>3 min</strong>
                </JourneyInfoRow>
                <JourneyInfoRow>
                  <span>Recovery time</span>
                  <strong>3 min</strong>
                </JourneyInfoRow>
                <JourneyInfoRow>
                  <span>Equipment requirement</span>
                  <strong>D, teli</strong>
                </JourneyInfoRow>
              </JourneyInfo>
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
