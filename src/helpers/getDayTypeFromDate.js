import getDay from "date-fns/get_day";

const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export function getDayTypeFromDate(date) {
  return dayTypes[getDay(date)];
}
