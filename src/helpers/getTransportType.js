import "../components/LineIcon.css";

function getTransportType(lineId) {
  const lineType = lineId.substring(0, 4);

  if (lineType >= 1001 && lineType <= 1010) {
    return "TRAM";
  }

  if (/^300[12]/.test(lineType)) {
    return "RAIL";
  }

  if (lineType.substr(1) === "560" || lineType.substr(1) === "550") {
    return "TRUNK";
  }

  return "BUS";
}

export default getTransportType;
