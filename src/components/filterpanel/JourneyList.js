import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import withHfpData from "../../hoc/withHfpData";
import map from "lodash/map";
import get from "lodash/get";
import sortBy from "lodash/sortBy";
import {app} from "mobx-app";
import getJourneyId from "../../helpers/getJourneyId";
import styled from "styled-components";
import {timeToFormat, combineDateAndTime} from "../../helpers/time";
import {Text, text} from "../../helpers/text";
import withDepartures from "../../hoc/withDepartures";
import doubleDigit from "../../helpers/doubleDigit";
import {observable, action} from "mobx";
import Loading from "../Loading";

const JourneyListWrapper = styled.div`
  margin-top: 1rem;
`;

const JourneyListRows = styled.div`
  max-height: 100%;
  overflow: auto;
`;

const JourneyListRow = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: ${({selected = false}) =>
    selected ? "var(--blue)" : "rgba(0, 0, 0, 0.025)"};
  padding: 0.75rem 1.25rem;
  border: 0;
  max-width: none;
  font-size: 1rem;
  cursor: pointer;
  color: ${({selected = false}) => (selected ? "white" : "var(--grey)")};
  outline: none;

  &:nth-child(odd) {
    background: ${({selected = false}) =>
      selected ? "var(--blue)" : "rgba(255, 255, 255, 0.025)"};
  }
`;

const JourneyListHeader = styled(JourneyListRow.withComponent("div"))`
  background: transparent;
  font-size: 0.9em;
  padding-top: 0;

  > *:last-child {
    align-self: flex-end;
    text-align: right;
  }
`;

const JourneyRowLeft = styled.span`
  margin-right: 1rem;
  display: block;
  font-weight: bold;
`;

@inject(app("Journey", "Time", "Filters"))
@withHfpData
@withDepartures
@observer
class JourneyList extends Component {
  @observable
  requestedJourney = "";
  @observable
  unrealizedJourneys = [];

  componentDidMount() {
    this.ensureSelectedVehicle();
  }

  componentDidUpdate({positions: prevPositions}, prevState) {
    this.ensureSelectedVehicle();
    const {requestedJourney, unrealizedJourneys} = this;
    const {selectedJourney} = this.props.state;

    if (
      !selectedJourney &&
      requestedJourney &&
      !unrealizedJourneys.includes(requestedJourney) &&
      prevPositions.length !== this.props.positions.length
    ) {
      this.checkReceivedJourneys();
    }
  }

  checkReceivedJourneys = action(() => {
    const {positions, Journey} = this.props;
    const {requestedJourney} = this;

    const journeys = map(positions, ({positions}) => positions[0]);

    for (const journey of journeys) {
      if (journey.journey_start_time === requestedJourney) {
        Journey.setSelectedJourney(journey);
        this.setRequestedJourney("");

        return;
      }
    }

    if (!this.unrealizedJourneys.includes(requestedJourney)) {
      this.unrealizedJourneys.push(requestedJourney);
    }
  });

  ensureSelectedVehicle = () => {
    const {Filters, state, positions} = this.props;
    const {vehicle, selectedJourney} = state;

    if (!selectedJourney) {
      if (vehicle !== "") {
        Filters.setVehicle("");
      }

      return;
    }

    const selectedJourneyId = getJourneyId(selectedJourney);
    const journeys = map(positions, ({positions}) => positions[0]);
    const journey = journeys.find((j) => getJourneyId(j) === selectedJourneyId);

    // Only set these if the journey is truthy and was not already selected
    if (journey && journey.unique_vehicle_id !== vehicle) {
      Filters.setVehicle(journey.unique_vehicle_id);
    }
  };

  selectJourney = (journey) => (e) => {
    e.preventDefault();
    const {Time, Journey, state} = this.props;

    // Only set these if the journey is truthy and was not already selected
    if (journey && getJourneyId(state.selectedJourney) !== getJourneyId(journey)) {
      Time.setTime(
        timeToFormat(journey.journey_start_timestamp, "HH:mm:ss", "Europe/Helsinki")
      );
    }

    Journey.setSelectedJourney(journey);
    this.setRequestedJourney("");
  };

  setRequestedJourney = action((journeyStartTime = "") => {
    const {Journey} = this.props;

    if (!this.unrealizedJourneys.includes(journeyStartTime)) {
      if (journeyStartTime) {
        Journey.setSelectedJourney(null);
      }

      this.requestedJourney = journeyStartTime;
    }
  });

  requestPlannedJourney = (plannedTime) => {
    const {Time, state} = this.props;

    Time.setTime(
      timeToFormat(
        combineDateAndTime(state.date, plannedTime, "Europe/Helsinki"),
        "HH:mm:ss",
        "Europe/Helsinki"
      )
    );

    this.setRequestedJourney(plannedTime);
  };

  getJourneyStartPosition(journeyId) {
    const {positions} = this.props;

    // Get the hfp data for this journey
    const journeyPositions = get(
      positions.find(({journeyId: jid}) => jid === journeyId),
      "positions",
      []
    );

    // Default to the first hfp event, ie when the data stream from this vehicle started
    let journeyStartHfp = journeyPositions[0];

    if (!journeyStartHfp) {
      return null;
    }

    for (let i = 1; i < journeyPositions.length; i++) {
      const current = journeyPositions[i];

      // Loop through the positions and find when the next_stop_id prop changes.
      // The hfp event BEFORE this is when the journey started, ie when
      // the vehicle departed the first terminal.
      if (current && current.next_stop_id !== journeyStartHfp.next_stop_id) {
        journeyStartHfp = journeyPositions[i - 1];
        break;
      }
    }

    return journeyStartHfp;
  }

  render() {
    const {positions, state, departures} = this.props;

    const journeys = map(positions, ({positions}) => positions[0]);
    const selectedJourney = get(state, "selectedJourney", null);
    const selectedJourneyId = getJourneyId(selectedJourney);

    const isSelected = (journey) =>
      selectedJourney && selectedJourneyId === getJourneyId(journey);

    const plannedDepartures = departures.reduce((planned, departure) => {
      const timeStr = `${doubleDigit(departure.hours)}:${doubleDigit(
        departure.minutes
      )}:00`;

      if (journeys.some((j) => j.journey_start_time === timeStr)) {
        return planned;
      }

      planned.push(timeStr);
      return planned;
    }, []);

    const departureList = sortBy([...journeys, ...plannedDepartures], (value) => {
      if (typeof value === "string") {
        return value;
      }

      return get(value, "journey_start_time", 0);
    });

    return (
      <JourneyListWrapper>
        <JourneyListHeader>
          <JourneyRowLeft>
            <Text>filterpanel.planned_start_time</Text>
          </JourneyRowLeft>
          <span>
            <Text>filterpanel.real_start_time</Text>
          </span>
        </JourneyListHeader>
        <JourneyListRows>
          {departureList.map((journeyOrDeparture, index) => {
            if (typeof journeyOrDeparture === "string") {
              return (
                <JourneyListRow
                  key={`planned_journey_row_${journeyOrDeparture}_${index}`}
                  onClick={() => this.requestPlannedJourney(journeyOrDeparture)}>
                  <JourneyRowLeft>{journeyOrDeparture}</JourneyRowLeft>
                  {this.unrealizedJourneys.includes(journeyOrDeparture) ? (
                    <span>{text("filterpanel.journey.unrealized")}</span>
                  ) : this.requestedJourney === journeyOrDeparture ? (
                    <span className="InlineLoading">
                      <Loading />
                    </span>
                  ) : (
                    <span>{text("filterpanel.journey.click_to_fetch")}</span>
                  )}
                </JourneyListRow>
              );
            }
            const journeyStartHfp = this.getJourneyStartPosition(
              getJourneyId(journeyOrDeparture)
            );

            return (
              <JourneyListRow
                selected={isSelected(journeyOrDeparture)}
                key={`journey_row_${getJourneyId(journeyOrDeparture)}`}
                onClick={this.selectJourney(journeyOrDeparture)}>
                <JourneyRowLeft>
                  {timeToFormat(
                    journeyOrDeparture.journey_start_timestamp,
                    "HH:mm:ss",
                    "Europe/Helsinki"
                  )}
                </JourneyRowLeft>
                {journeyStartHfp && (
                  <span>
                    {timeToFormat(
                      journeyStartHfp.received_at,
                      "HH:mm:ss",
                      "Europe/Helsinki"
                    )}
                  </span>
                )}
              </JourneyListRow>
            );
          })}
        </JourneyListRows>
      </JourneyListWrapper>
    );
  }
}

export default JourneyList;
