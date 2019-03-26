import {Component} from "react";
import {observer, inject} from "mobx-react";
import {computed} from "mobx";
import last from "lodash/last";
import get from "lodash/last";
import findLast from "lodash/findLast";

function timeRangeFromEvents(events) {
  const firstEvent = events[0];
  const lastEvent = last(events);

  const firstTime = get(firstEvent, "recordedAtUnix", 0);
  const lastTime = get(lastEvent, "recordedAtUnix", 0);

  return [{time: firstTime, event: firstEvent}, {time: lastTime, event: lastEvent}];
}

@inject("state")
@observer
class JourneyPosition extends Component {
  @computed
  get journeyEvents() {
    const {
      state: {unixTime, isLiveAndCurrent},
      journeys,
    } = this.props;

    return this.matchJourneyEvents(unixTime, journeys, isLiveAndCurrent);
  }

  @computed get journeys() {
    const {journeys} = this.props;
    console.log(journeys);

    return [];
  }

  matchEventLive(time, events) {
    const candidate = findLast(events, (event) => {
      if (!event.lat || !event.lng) {
        return false;
      }

      const eventTime = event.recordedAtUnix;
      return Math.abs(time - eventTime) < 10;
    });

    console.log(candidate);
    return candidate;
  }

  matchEventToTime = (time, events, defaultToEnds = true) => {
    let i = 0;
    let checkSeconds = time;
    let nextEvent = null;
    let alternate = last(events).recordedAtTime > time;

    // Max iterations is 60, which means events can be at most 30 seconds before
    // or after i to be displayed.
    while (!nextEvent && i <= 60) {
      nextEvent = findLast(
        events,
        ({recordedAtUnix = 0}) => Math.abs(checkSeconds - recordedAtUnix) <= 5
      );

      if (nextEvent) {
        break;
      }

      i++;

      if (alternate) {
        // Alternately check after (even i) and before (odd i) `time`
        if (i % 2 === 0) {
          checkSeconds = time + Math.round(i / 2);
        } else {
          checkSeconds = time - Math.round(i / 2);
        }
      } else {
        checkSeconds = time - 1;
      }
    }

    // If we didn't find anything and the events start after the given time,
    // just go with the first event. Similarly, if the last event is before
    // the given time, select the last event. Can be disabled by setting
    // defaultToEnd to false.
    if (!nextEvent && defaultToEnds) {
      const [
        {time: firstTime, event: firstEvent},
        {time: lastTime, event: lastEvent},
      ] = timeRangeFromEvents(events);

      if (firstTime > time) {
        nextEvent = firstEvent;
      } else if (lastTime < time) {
        nextEvent = lastEvent;
      }
    }

    return nextEvent;
  };

  // Matches the current time setting with an event from this journey.
  matchJourneyEvents = (time, journeys, isLive) => {
    const journeyEvents = new Map();

    if (journeys.length === 0) {
      return;
    }

    journeys.forEach(({id, events}) => {
      if (events.length === 0) {
        return;
      }

      if (journeys.length > 1) {
        const [{time: firstTime}, {time: lastTime}] = timeRangeFromEvents(events);

        if (firstTime > time || lastTime < time) {
          return;
        }
      }

      let nextEvent;

      if (isLive) {
        nextEvent = this.matchEventLive(time, events);
      } else {
        nextEvent = this.matchEventToTime(time, events, journeys.length === 1);
      }

      journeyEvents.set(id, nextEvent);
    });

    return journeyEvents;
  };

  render() {
    const {children} = this.props;
    return children(this.journeyEvents);
  }
}

export default JourneyPosition;
