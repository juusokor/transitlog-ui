import doubleDigit from "./doubleDigit";

export function departuresToTimes(departures = []) {
  return departures.map(
    (departure) =>
      `${doubleDigit(departure.hours)}:${doubleDigit(departure.minutes)}:00`
  );
}
