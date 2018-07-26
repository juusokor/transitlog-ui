import "../components/LineIcon.css";

function getTransportType(lineId) {
  const lineType = parseInt(lineId.substring(0, 4));

  if (lineType <= 1010) {
    return "TRAM";
  }

  if (lineType < 2000) {
    return "BUS";
  }

  if (lineType < 3000) {
    return "TRUNK";
  }

  if (lineType < 3010) {
    return "TRAIN";
  }
}

export default getTransportType;
