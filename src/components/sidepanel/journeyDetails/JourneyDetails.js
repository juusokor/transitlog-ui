import React from "react";
import styled from "styled-components";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import JourneyStops from "./JourneyStops";
import {LoadingDisplay} from "../../Loading";
import JourneyInfo from "./JourneyInfo";
import DestinationStop from "./DestinationStop";
import withRoute from "../../../hoc/withRoute";
import OriginStop from "./OriginStop";
import {observable, action} from "mobx";
import {getMomentFromDateTime} from "../../../helpers/time";

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

const Loading = styled(LoadingDisplay)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 1rem auto 0;
`;

@inject(app("UI", "Time", "Filters"))
@withRoute({alwaysFetch: true})
@observer
class JourneyDetails extends React.Component {
  @observable
  stopsExpanded = false;

  toggleStopsExpanded = action((setTo = !this.stopsExpanded) => {
    this.stopsExpanded = setTo;
  });

  onClickTime = (time) => () => {
    this.props.Time.setTime(time);
  };

  onSelectStop = (stopId) => () => {
    const {Filters} = this.props;

    if (stopId) {
      Filters.setStop(stopId);
    }
  };

  onHoverStop = (stopId) => () => {
    this.props.UI.highlightStop(stopId);
  };

  render() {
    const {
      state: {date, time},
      route,
      selectedJourneyEvents,
      journeyStops,
      loading = false,
    } = this.props;
    // Select the first event to define the journey
    const events = get(selectedJourneyEvents, "[0].events", []);
    const journey = get(events, "[0]", {});
    return (
      <JourneyPanelWrapper>
        <JourneyDetailsHeader
          currentTime={getMomentFromDateTime(date, time)}
          events={events}
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
            {journeyStops.length !== 0 ? (
              <StopsListWrapper>
                <OriginStop
                  onHoverStop={this.onHoverStop}
                  onSelectStop={this.onSelectStop}
                  stop={journeyStops[0]}
                  date={date}
                  onClickTime={this.onClickTime}
                  stopsExpanded={this.stopsExpanded}
                />
                <JourneyStops
                  onHoverStop={this.onHoverStop}
                  onSelectStop={this.onSelectStop}
                  journeyStops={journeyStops.slice(1, -1)}
                  date={date}
                  route={route}
                  onClickTime={this.onClickTime}
                  stopsExpanded={this.stopsExpanded}
                  toggleStopsExpanded={this.toggleStopsExpanded}
                />
                <DestinationStop
                  onHoverStop={this.onHoverStop}
                  onSelectStop={this.onSelectStop}
                  stop={journeyStops.slice(-1)[0]}
                  date={date}
                  onClickTime={this.onClickTime}
                />
              </StopsListWrapper>
            ) : loading ? (
              <Loading loading={true} />
            ) : null}
          </JourneyPanelContent>
        </ScrollContainer>
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
