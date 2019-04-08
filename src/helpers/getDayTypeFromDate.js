import getDay from "date-fns/get_day";

export const dayTypes = ["Su", "Ma", "Ti", "Ke", "To", "Pe", "La"];

export function getDayTypeFromDate(date) {
  return dayTypes[getDay(date)];
}
