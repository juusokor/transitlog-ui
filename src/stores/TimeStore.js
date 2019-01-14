import {extendObservable, reaction, action} from "mobx";
import moment from "moment";
import timer from "../helpers/timer";
import timeActions from "./timeActions";
import {combineDateAndTime, timeToFormat} from "../helpers/time";
import get from "lodash/get";

let timerHandle = null;

export default (state, initialState) => {
  extendObservable(state, {
    time: get(
      initialState,
      "time",
      timeToFormat(new Date(), "HH:mm:ss", "Europe/Helsinki")
    ),
    get unixTime() {
      const {date, time} = state;
      return combineDateAndTime(date, time, "Europe/Helsinki").unix();
    },
    playing: false,
    timeIncrement: 5,
    marginMinutes: 5,
    areaSearchRangeMinutes: 60,
  });

  const actions = timeActions(state);

  const onAutoplayIteration = () => {
    const nextTimeValue = moment(state.time, "HH:mm:ss")
      .add(state.timeIncrement, "seconds")
      .format("HH:mm:ss");

    actions.setTime(nextTimeValue);
  };

  const toggleAutoplay = action(() => {
    state.playing = !state.playing;
  });

  reaction(
    () => state.playing,
    (isPlaying) => {
      if (isPlaying && !timerHandle) {
        // timer() is a setInterval alternative that uses requestAnimationFrame.
        // This makes it more performant and can "pause" when the tab is not focused.
        timerHandle = timer(() => onAutoplayIteration(), 1000);
      } else if (!isPlaying && !!timerHandle) {
        cancelAnimationFrame(timerHandle.value);
        timerHandle = null;
      }
    }
  );

  return {
    ...actions,
    toggleAutoplay,
  };
};
