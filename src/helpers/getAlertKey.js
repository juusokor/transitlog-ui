export const getAlertKey = (alert) =>
  [
    alert.title,
    alert.affectedId,
    alert.level,
    alert.distribution,
    alert.startDateTime,
    alert.endDateTime,
  ].join("_");
