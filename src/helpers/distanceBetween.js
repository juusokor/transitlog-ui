// From http://stackoverflow.com/a/18883823/5710637
function distanceBetween(lat1, lon1, lat2, lon2) {
  let R = 6371; // km
  let dLat = toRad(lat2 - lat1);
  let dLon = toRad(lon2 - lon1);
  let radLat1 = toRad(lat1);
  let radLat2 = toRad(lat2);

  let a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  let d = R * c;
  return d;
}

// Converts numeric degrees to radians
// From http://stackoverflow.com/a/18883823/5710637
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

export default distanceBetween;
