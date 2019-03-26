import {Component} from "react";
import {observer, inject} from "mobx-react";
import {reaction, observable, action} from "mobx";
import last from "lodash/last";
import findLast from "lodash/findLast";
import get from "lodash/get";

@inject("state")
@observer
class JourneyPosition extends Component {
  eventReaction = () => {};
  events = new Map();

  @observable
  journeyEvents = new Map();

  // Matches the current time setting with an event from this journey.
  matchJourneyEvents = (time) => {
    if (this.events.size === 0) {
      return;
    }

    this.events.forEach((indexedEvents, journeyId, {length}) => {
      // Attempt to find the correct hfp item from the indexed events
      let nextEvent = indexedEvents.get(time);

      if (!nextEvent) {
        // If no events matched the current time exactly, look backwards and forwards
        // 10 seconds respectively to find a matching hfp event.
        nextEvent = this.matchEventToTime(time, indexedEvents, length === 1);
      }

      this.setMatchedEventForJourney(journeyId, nextEvent);
    });
  };

  getLivePositions = (journeys, time) => {
    journeys.forEach(({id, events = []}) => {
      if (events.length !== 0) {
        const event = this.matchEventLive(time, events);

        if (event) {
          this.setMatchedEventForJourney(id, event);
        }
      }
    });
  };

  matchEventLive(time, events) {
    const candidate = findLast(events, (event) => {
      if (!event.lat || !event.lng) {
        return false;
      }

      const eventTime = event.recordedAtUnix;
      return Math.abs(time - eventTime) < 10;
    });

    return candidate;
  }

  matchEventToTime = (time, indexedEvents, defaultToEnds = true) => {
    let i = 0;
    let checkSeconds = time;
    let nextEvent = null;

    // Max iterations is 30, which means events can be at most 30 seconds before
    // or after i to be displayed.
    while (!nextEvent && i <= 30) {
      // Alternately check after (even i) and before (odd i) `time`
      if (i % 2 === 0) {
        checkSeconds = time + Math.round(i / 2);
      } else {
        checkSeconds = time - Math.round(i / 2);
      }

      nextEvent = indexedEvents.get(checkSeconds);
      i++;
    }

    // If we didn't find anything and the events start after the given time,
    // just go with the first event. Similarly, if the last event is before
    // the given time, select the last event. Can be disabled by setting
    // defaultToEnd to false.
    if (!nextEvent && defaultToEnds) {
      const eventKeys = Array.from(indexedEvents.keys());

      const firstIndexedTime = eventKeys[0];
      const lastIndexedTime = last(eventKeys);

      if (firstIndexedTime > time) {
        nextEvent = indexedEvents.values().next().value;
      } else if (lastIndexedTime < time) {
        nextEvent = last(Array.from(indexedEvents.values()));
      }
    }

    return nextEvent;
  };

  setMatchedEventForJourney = action((journeyId, nextEvent) => {
    this.journeyEvents.set(journeyId, nextEvent);
  });

  // Index the journey events under their timestamp to make it easy to find them on the fly.
  // This is a performance optimization.
  indexPositions = (events) => {
    return events.reduce((eventIndex, event) => {
      if (event.lat && event.lng) {
        const key = event.recordedAtUnix;
        eventIndex.set(key, event);
      }

      return eventIndex;
    }, new Map());
  };

  indexJourneys = (journeys) => {
    this.journeyEvents.clear();

    this.events = journeys.reduce((journeyIndex, {id = "", events = []}) => {
      const indexedEvents = this.indexPositions(events);
      journeyIndex.set(id, indexedEvents);
      return journeyIndex;
    }, new Map());
  };

  componentDidMount() {
    const {state, journeys} = this.props;

    if (!state.isLiveAndCurrent && journeys.length !== 0) {
      // Index once when mounted if not live-updating
      this.indexJourneys(journeys);
    } else if (state.isLiveAndCurrent && journeys.length !== 0) {
      this.getLivePositions(journeys, state.unixTime);
    }

    // A reaction to set the hfp event that matches the currently selected time
    this.eventReaction = reaction(
      () => [state.unixTime, state.isLiveAndCurrent],
      ([time, live]) => {
        if (!live && time) {
          this.matchJourneyEvents(time);
        }
      },
      {fireImmediately: true}
    );
  }

  componentDidUpdate({events: prevPositions}) {
    const {
      journeys = [],
      state: {unixTime, isLiveAndCurrent},
    } = this.props;

    // If the journeys changed we need to index again.
    if (
      !isLiveAndCurrent &&
      (journeys !== prevPositions || journeys.length !== prevPositions.length)
    ) {
      this.indexJourneys(journeys);
      this.matchJourneyEvents(unixTime);
    }

    if (isLiveAndCurrent && journeys.length !== 0) {
      this.getLivePositions(journeys, unixTime);
    }
  }

  componentWillUnmount() {
    if (typeof this.eventReaction === "function") {
      // Dispose the reaction
      this.eventReaction();
    }
  }

  render() {
    const {children} = this.props;
    return children(this.journeyEvents);
  }
}

export default JourneyPosition;
