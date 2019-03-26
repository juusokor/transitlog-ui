import React, {useCallback, useState, useMemo, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import AreaJourneysQuery from "../queries/AreaJourneysQuery";
import invoke from "lodash/invoke";
import flow from "lodash/flow";
import {setResetListener} from "../stores/FilterStore";
import {TIMEZONE} from "../constants";
import {inject} from "../helpers/inject";
import moment from "moment-timezone";

const decorate = flow(
  observer,
  inject("state")
);

const AreaJourneys = decorate((props) => {
  const {children, skip, state} = props;
  const {isLiveAndCurrent, areaSearchRangeMinutes, unixTime} = state;

  const timeRange = useRef(null);
  const [queryBounds, setQueryBoundsState] = useState(null);

  // Set new query bounds if they are valid and not equal to the previous bounds.
  const setQueryBounds = useCallback(
    (bounds) => {
      if (!bounds || !invoke(bounds, "isValid")) {
        setQueryBoundsState(null);
      }

      if (queryBounds && queryBounds.isValid() && queryBounds.equals(bounds)) {
        return;
      }

      setQueryBoundsState(bounds);
    },
    [queryBounds]
  );

  // Create a new moment for the current time when it changes. No update when there are no bounds.
  const queryTime = useMemo(
    () => (!queryBounds ? null : moment.unix(unixTime).tz(TIMEZONE)),
    [!queryBounds ? 0 : unixTime]
  );

  // Check if the time is in range of the previously queried time range. If it is
  // we should not do a new query when the time changes.
  const timeIsInRange = useMemo(() => {
    if (!queryTime) {
      return false;
    }

    if (!timeRange.current) {
      return true;
    }

    return queryTime.isBetween(
      timeRange.current.min,
      timeRange.current.max,
      "second",
      "[]" // Moment's way of specifying inclusion
    );
  }, [timeRange.current, queryTime]);

  // Get the time range to query with.
  const queryTimeRange = useMemo(() => {
    if (!queryTime) {
      return null;
    }

    // Constrain search time span to 1 minute when auto-polling.
    const timespan = isLiveAndCurrent ? 1 : areaSearchRangeMinutes;

    const min = queryTime
      .clone()
      .subtract(Math.round(timespan / 2), "minutes")
      .startOf("minute");

    const max = queryTime
      .clone()
      .add(Math.round(timespan / 2), "minutes")
      .endOf("minute");

    const range = {min, max};
    timeRange.current = range;

    return range;
  }, [timeIsInRange, isLiveAndCurrent ? 1 : areaSearchRangeMinutes]);

  // Combine all values in a unified values object.
  const queryVars = useMemo(() => {
    if (
      !queryBounds ||
      !queryTimeRange ||
      (typeof queryBounds.isValid === "function" && !queryBounds.isValid())
    ) {
      return {};
    }

    // Translate the bounding box to a min/max query for the HFP api and create a time range.
    return {
      minTime: queryTimeRange.min.toISOString(true),
      maxTime: queryTimeRange.max.toISOString(true),
      bbox: queryBounds.toBBoxString(),
    };
  }, [queryBounds, queryTimeRange]);

  useEffect(() => setResetListener(() => setQueryBounds(null)), []);

  return (
    <AreaJourneysQuery
      skip={skip} // Skip query if some params are falsy
      {...queryVars}>
      {({journeys, loading, error}) =>
        children({
          setQueryBounds: setQueryBounds,
          // Query bounds may be limited in some cases. This contains the actual bounds used in the request.
          actualQueryBounds: false,
          journeys,
          loading,
          error,
        })
      }
    </AreaJourneysQuery>
  );
});

export default AreaJourneys;
