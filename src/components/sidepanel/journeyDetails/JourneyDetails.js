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
import OriginStop from "./OriginStop";
import {observable, action} from "mobx";
import {getMomentFromDateTime} from "../../../helpers/time";
import {transportColor} from "../../transportModes";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
  position: relative;
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
      journey = null,
      loading = false,
    } = this.props;

    const stopMode = get(journey, "mode", "BUS");
    const stopColor = get(transportColor, stopMode, "var(--light-grey)");

    return (
      <JourneyPanelWrapper>
        {journey ? (
          <>
            <JourneyDetailsHeader
              currentTime={getMomentFromDateTime(date, time)}
              journey={journey}
              date={date}
            />
            <ScrollContainer>
              <JourneyPanelContent>
                {journey.departures.length !== 0 && (
                  <>
                    <JourneyInfo date={date} journey={journey} />
                    <StopsListWrapper>
                      <OriginStop
                        onHoverStop={this.onHoverStop}
                        onSelectStop={this.onSelectStop}
                        departure={journey.departures[0]}
                        color={stopColor}
                        date={date}
                        onClickTime={this.onClickTime}
                        stopsExpanded={this.stopsExpanded}
                      />
                      <JourneyStops
                        onHoverStop={this.onHoverStop}
                        onSelectStop={this.onSelectStop}
                        departures={journey.departures.slice(1, -1)}
                        date={date}
                        color={stopColor}
                        onClickTime={this.onClickTime}
                        stopsExpanded={this.stopsExpanded}
                        toggleStopsExpanded={this.toggleStopsExpanded}
                      />
                      <DestinationStop
                        onHoverStop={this.onHoverStop}
                        onSelectStop={this.onSelectStop}
                        departure={journey.departures[journey.departures.length - 1]}
                        date={date}
                        color={stopColor}
                        onClickTime={this.onClickTime}
                      />
                    </StopsListWrapper>
                  </>
                )}
              </JourneyPanelContent>
            </ScrollContainer>
          </>
        ) : loading ? (
          <Loading loading={true} />
        ) : null}
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
