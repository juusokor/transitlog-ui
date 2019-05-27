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
import {getAlertsInEffect} from "../../../helpers/getAlertsInEffect";
import {text} from "../../../helpers/text";
import CancellationsList from "../../CancellationsList";

const JourneyPanelWrapper = styled.div`
  height: 100%;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  align-items: stretch;
  position: relative;
`;

const ListWrapper = styled.div``;

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
      state: {date, timeMoment},
      journey = null,
      route = null,
      loading = false,
    } = this.props;

    const journeyMode = get(route, "mode", "BUS");
    const journeyColor = get(transportColor, journeyMode, "var(--light-grey)");
    const stopDepartures = get(journey, "departures", []);

    const journeyTime =
      stopDepartures.length !== 0
        ? get(stopDepartures, "[0].observedDepartureTime.departureDateTime", timeMoment)
        : timeMoment;

    const alerts = getAlertsInEffect(
      get(journey, "alerts", []).length !== 0 ? journey : route,
      journeyTime
    );

    const cancellations = get(journey, "cancellations", get(route, "cancellations", []));

    return (
      <JourneyPanelWrapper data-testid="journey-details">
        <LoadingDisplay loading={loading} />
        <JourneyDetailsHeader journey={journey} route={route} />
        <ScrollContainer>
          <JourneyPanelContent>
            <JourneyInfo date={date} journey={journey} />
            <Tabs suggestedTab="journey-stops">
              {stopDepartures.length !== 0 && (
                <JourneyStops
                  cancellations={cancellations}
                  loading={loading}
                  name="journey-stops"
                  label={text("journey.stops")}
                  departures={stopDepartures}
                  date={date}
                  color={journeyColor}
                />
              )}
              {(alerts.length !== 0 || cancellations.length !== 0) && (
                <ListWrapper name="journey-alerts" label={text("domain.alerts")}>
                  {cancellations.length !== 0 && (
                    <CancellationsList
                      cancellations={cancellations}
                      showListHeading={true}
                    />
                  )}
                  {alerts.length !== 0 && (
                    <AlertsList showListHeading={true} alerts={alerts} />
                  )}
                </ListWrapper>
              )}
            </Tabs>
          </JourneyPanelContent>
        </ScrollContainer>
      </JourneyPanelWrapper>
    );
  }
}
export default JourneyDetails;
