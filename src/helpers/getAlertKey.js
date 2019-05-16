export const getAlertKey = (alert) =>
  [
    alert.title,
    alert.affectedId,
    alert.level,
    alert.distribution,
    alert.startDateTime,
    alert.endDateTime,
  ].join("_");

export const getCancellationKey = (cancellation) =>
  [
    cancellation.routeId,
    cancellation.direction,
    cancellation.departureDate,
    cancellation.journeyStartTime,
    cancellation.isCancelled ? "cancelled" : "restored",
  ].join("_");
