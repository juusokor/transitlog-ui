import {Component} from "react";
import {inject, Observer} from "mobx-react";
import {computed, observable, runInAction} from "mobx";
import last from "lodash/last";
import get from "lodash/last";
import findLast from "lodash/findLast";
import React from "react";

function timeRangeFromEvents(events) {
  const firstEvent = events[0];
  const lastEvent = last(events);

  const firstTime = get(firstEvent, "recordedAtUnix", 0);
  const lastTime = get(lastEvent, "recordedAtUnix", 0);

  return [{time: firstTime, event: firstEvent}, {time: lastTime, event: lastEvent}];
}

const MAX_TIME_DIFF = 60;

@inject("state")
// No @observer since the computed function would run twice on each time update.
class JourneyPosition extends Component {
  // Observable journeys so that the events are recomputed when the journeys change.
  @observable.ref
  journeys = this.props.journeys;

  @computed
  get journeyEvents() {
    const {
      state: {unixTime, isLiveAndCurrent},
    } = this.props;

    return this.matchJourneyEvents(unixTime, this.journeys, isLiveAndCurrent);
  }

  componentDidUpdate() {
    const {journeys} = this.props;

    // Update the observable journeys value if the journeys change. The journey array
    // can be compared with equality which is nice.
    if (journeys && journeys.length && journeys !== this.ourneys) {
      runInAction(() => (this.journeys = journeys));
    }
  }

  matchEventLive(time, events) {
    return findLast(events, (event) => {
      if (!event.lat || !event.lng) {
        return false;
      }

      const eventTime = event.recordedAtUnix;
      return Math.abs(time - eventTime) <= MAX_TIME_DIFF;
    });
  }

  // Precisely match the current time to an event. If defaultToEnds is true, the first or last
  // event will be picked when the time is out of range.
  matchEventToTime = (time, events, defaultToEnds = true) => {
    let i = 0;
    let checkSeconds = time;

    if (defaultToEnds) {
      const [
        {time: firstTime, event: firstEvent},
        {time: lastTime, event: lastEvent},
      ] = timeRangeFromEvents(events);

      if (firstTime > time) {
        // Return the first event if it it is later than the current time.
        return firstEvent;
      } else if (lastTime < time) {
        // Return the last event if it is before the current time.
        return lastEvent;
      }
    }

    let alternate = last(events).recordedAtUnix > time;

    // Max iterations is the maximum amount of seconds an event can differ from the current time.
    while (i <= MAX_TIME_DIFF) {
      if (alternate) {
        // Alternately check after (even i) and before (odd i) time
        if (i % 2 === 0) {
          checkSeconds = time + Math.round(i / 2);
        } else {
          checkSeconds = time - Math.round(i / 2);
        }
      } else {
        checkSeconds = time - i;
      }

      for (let e = events.length; e > 0; e--) {
        const event = events[e];

        if (
          event &&
          event.lat &&
          event.lng &&
          Math.abs(checkSeconds - event.recordedAtUnix) <= 1
        ) {
          return event;
        }
      }

      i++;
    }

    return null;
  };

  // Matches the current time with an event for each journey. If live mode is activated,
  // he matching can be done slightly less expensive.
  matchJourneyEvents = (time, journeys, isLive) => {
    const journeyEvents = new Map();

    if (journeys.length === 0) {
      return journeyEvents;
    }

    journeys.forEach(({id, events}) => {
      if (events.length === 0) {
        return;
      }

      // Prevent events from staying active if the time is before the first event or past the last event.
      // Only active when there are many journeys on the map (ie area search)
      if (journeys.length > 1) {
        const [{time: firstTime}, {time: lastTime}] = timeRangeFromEvents(events);

        if (firstTime > time || lastTime < time) {
          return;
        }
      }

      let nextEvent;

      if (!isLive) {
        // Precise matching when not live
        nextEvent = this.matchEventToTime(time, events, journeys.length === 1);
      } else {
        // Take the last event of the journey when live
        nextEvent = this.matchEventLive(time, events);
      }

      journeyEvents.set(id, nextEvent);
    });

    return journeyEvents;
  };

  render() {
    const {children} = this.props;
    return <Observer>{() => children(this.journeyEvents)}</Observer>;
  }
}

export default JourneyPosition;
