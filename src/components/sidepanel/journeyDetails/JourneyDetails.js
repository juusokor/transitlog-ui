import React from "react";
import styled from "styled-components";
import JourneyDetailsHeader from "./JourneyDetailsHeader";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import JourneyStops from "./JourneyStops";
import {LoadingDisplay} from "../../Loading";
import JourneyInfo from "./JourneyInfo";
import {transportColor} from "../../transportModes";
import Tabs from "../Tabs";
import AlertsList from "../../AlertsList";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
  position: relative;
`;

const ScrollContainer = styled.div`
  height: 100%;
  position: relative;
  overflow-y: auto;
  overflow-x: hidden;
`;

const JourneyPanelContent = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: auto;
  width: 100%;
`;

@inject(app("UI", "Time", "Filters"))
@observer
class JourneyDetails extends React.Component {
  render() {
    const {
      state: {date},
      journey = null,
      route = null,
      loading = false,
    } = this.props;

    const journeyMode = get(route, "mode", "BUS");
    const journeyColor = get(transportColor, journeyMode, "var(--light-grey)");
    const stopDepartures = get(journey, "departures", []);

    return (
      <JourneyPanelWrapper>
        <LoadingDisplay loading={loading} />
        <JourneyDetailsHeader journey={journey} route={route} />
        <ScrollContainer>
          <JourneyPanelContent>
            <JourneyInfo date={date} journey={journey} />
            <Tabs suggestedTab="journey-stops">
              {stopDepartures.length !== 0 && (
                <JourneyStops
                  loading={loading}
                  name="journey-stops"
                  label="Stops"
                  departures={stopDepartures}
                  date={date}
                  color={journeyColor}
                />
              )}
              {get(route, "alerts", []).length !== 0 && (
                <AlertsList alerts={route.alerts} name="journey-alerts" label="Alerts" />
              )}
            </Tabs>
          </JourneyPanelContent>
        </ScrollContainer>
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
