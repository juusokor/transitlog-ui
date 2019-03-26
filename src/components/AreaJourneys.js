import React, {useCallback, useState, useMemo, useEffect, useRef} from "react";
import {observer} from "mobx-react-lite";
import AreaJourneysQuery from "../queries/AreaJourneysQuery";
import invoke from "lodash/invoke";
import flow from "lodash/flow";
import {getMomentFromDateTime} from "../helpers/time";
import {setResetListener} from "../stores/FilterStore";
import {TIMEZONE} from "../constants";
import {inject} from "../helpers/inject";

const decorate = flow(
  observer,
  inject("state")
);

const AreaJourneys = decorate((props) => {
  const {children, skip, state} = props;
  const timeRange = useRef(null);

  const [queryBounds, setQueryBoundsState] = useState(null);

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

  const queryTime = useMemo(
    () => getMomentFromDateTime(state.date, state.time, TIMEZONE),
    [state.date, state.time]
  );

  const timeIsInRange = !timeRange.current
    ? false
    : queryTime.isBetween(timeRange.current.min, timeRange.current.max, "second");

  const {isLiveAndCurrent, areaSearchRangeMinutes} = state;

  const queryTimeRange = useMemo(() => {
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
  }, [timeIsInRange, isLiveAndCurrent, areaSearchRangeMinutes]);

  const queryVars = useMemo(() => {
    if (
      !queryBounds ||
      (typeof queryBounds.isValid === "function" && !queryBounds.isValid())
    ) {
      return {};
    }

    // Translate the bounding box to a min/max query for the HFP api and create a time range.
    return {
      minTime: queryTimeRange.min.toISOString(),
      maxTime: queryTimeRange.max.toISOString(),
      bbox: queryBounds.toBBoxString(),
    };
  }, [queryBounds, queryTimeRange.current, isLiveAndCurrent, areaSearchRangeMinutes]);

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
