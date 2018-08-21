function utc(d) {
  return Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    d.getHours(),
    d.getMinutes(),
    d.getSeconds(),
    d.getMilliseconds()
  );
}

export default (date1, date2) => {
  return Math.trunc((utc(date2) - utc(date1)) / 1000); // Returns seconds
};
