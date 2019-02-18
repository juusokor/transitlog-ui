import "../components/LineIcon.css";

function getTransportType(lineId, numeric = false) {
  const lineType = lineId.substring(0, 4);

  if (lineType >= 1001 && lineType <= 1010) {
    if (numeric) {
      return 0;
    }

    return "TRAM";
  }

  if (/^300[12]/.test(lineType)) {
    if (numeric) {
      return 100;
    }

    return "RAIL";
  }

  if (lineType.substr(1) === "560" || lineType.substr(1) === "550") {
    if (numeric) {
      return 1000;
    }

    return "TRUNK";
  }

  if (numeric) {
    return 1000;
  }

  return "BUS";
}

export default getTransportType;
