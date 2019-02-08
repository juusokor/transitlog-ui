import React from "react";
import styled from "styled-components";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import JourneyStops from "./JourneyStops";
import JourneyInfo from "./JourneyInfo";
import DestinationStop from "./DestinationStop";
import withRoute from "../../../hoc/withRoute";
import OriginStop from "./OriginStop";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
`;

const ScrollContainer = styled.div`
  height: 100%;
  position: relative;
  overflow: auto;
`;

const JourneyPanelContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: auto;
  width: 100%;
`;

const StopsListWrapper = styled.div`
  padding: 2rem 0 1rem;
`;

@inject(app("Time"))
@withRoute
@observer
class JourneyDetails extends React.Component {
  onClickTime = (time) => (e) => {
    e.preventDefault();
    this.props.Time.setTime(time);
  };

  render() {
    const {
      state: {date, route},
      selectedJourneyEvents,
      journeyStops,
    } = this.props;
    // Select the first event to define the journey
    const events = get(selectedJourneyEvents, "[0].events", []);
    const journey = get(events, "[0]", {});

    return (
      <JourneyPanelWrapper>
        <JourneyDetailsHeader
          journey={journey}
          date={date}
          mode={get(route, "mode", "BUS")}
          routeId={get(route, "routeId", "")}
          name={get(route, "nameFi")}
        />
        <ScrollContainer>
          <JourneyPanelContent>
            <JourneyInfo
              date={date}
              journey={journey}
              journeyHfp={events}
              originStop={journeyStops[0]}
              destinationStop={journeyStops.slice(-1)[0]}
            />
            {journeyStops.length !== 0 && (
              <StopsListWrapper>
                <OriginStop
                  stop={journeyStops[0]}
                  date={date}
                  onClickTime={this.onClickTime}
                />
                <JourneyStops
                  journeyStops={journeyStops.slice(1, -2)}
                  date={date}
                  route={route}
                  onClickTime={this.onClickTime}
                />
                <DestinationStop
                  stop={journeyStops.slice(-1)[0]}
                  date={date}
                  onClickTime={this.onClickTime}
                />
              </StopsListWrapper>
            )}
          </JourneyPanelContent>
        </ScrollContainer>
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
