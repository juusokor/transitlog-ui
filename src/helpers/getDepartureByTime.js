import orderBy from "lodash/orderBy";

export function getDepartureByTime(departures = [], time = "") {
  if (!departures || departures.length === 0 || !time) {
    return null;
  }

  // Get numeric hour and minute values from the provided time string
  const timeHour = parseInt(time.split(":")[0], 10);
  const timeMinute = parseInt(time.split(":")[1], 10);

  // Get all departures that match by the hour
  const selectedHourDepartures = departures.filter(({hours}) => timeHour === hours);

  if (selectedHourDepartures) {
    /*
     Sort the departures by how closely the minutes match the provided time.
     To get a sort value, the provided minute value is subtracted from the departure
     minutes. So if the minute value is 30, and the departure minute value is also
     30, the sort value is 0 and the departure is first in the list.
    */
    return orderBy(selectedHourDepartures, (departure) =>
      Math.abs(departure.minutes - timeMinute)
    )[0]; // Return the first element
  }

  return null;
}
