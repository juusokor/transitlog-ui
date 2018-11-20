import {action} from "mobx";
import moment from "moment-timezone";
import get from "lodash/get";
import createHistory from "history/createBrowserHistory";

const filterActions = (state) => {
  const history = createHistory();

  // Make sure all dates are correctly formed.
  const setDate = action("Set date", (dateValue) => {
    let momentValue = !dateValue
      ? moment()
      : moment.tz(dateValue, "Europe/Helsinki");

    if (!momentValue.isValid()) {
      momentValue = moment();
    }

    state.date = momentValue.format("YYYY-MM-DD");
  });

  // Grab the stopId from the passed stop object.
  const setStop = action("Set stop", (stop = "") => {
    // Either get the stopId prop or treat the stop arg as the stopId.
    state.stop = get(stop, "stopId", stop);

    // The following will be replaced with a better
    // URL management solution in a future PR.

    const query = new URLSearchParams(history.location.search);

    if (!stop) {
      query.delete("stop");
    } else if (query.has("stop")) {
      query.set("stop", stop);
    } else {
      query.append("stop", stop);
    }

    const queryStr = query.toString();
    history.push({search: queryStr});
  });

  // The unique_vehicle_id we're interested in.
  const setVehicle = action("Set vehicle", (vehicleId) => {
    state.vehicle = vehicleId || "";
  });

  const setLine = action(
    "Set line",
    ({lineId = "", dateBegin = "", dateEnd = ""}) => {
      state.line.lineId = lineId;
      state.line.dateBegin = dateBegin;
      state.line.dateEnd = dateEnd;
    }
  );

  const setRoute = action("Set route", (route) => {
    state.route.routeId = get(route, "routeId", "");
    state.route.direction = get(route, "direction", "");
    state.route.dateBegin = get(route, "dateBegin", "");
    state.route.dateEnd = get(route, "dateEnd", "");
    state.route.originstopId = get(route, "originstopId", "");

    const routeLine = get(route, "line.nodes[0]", null);

    if (routeLine) {
      setLine(routeLine);
    }
  });

  return {
    setDate,
    setStop,
    setVehicle,
    setLine,
    setRoute,
  };
};

export default filterActions;
