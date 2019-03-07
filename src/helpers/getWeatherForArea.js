import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

export async function getWeatherForArea(
  position,
  startDate,
  endDate,
  setCancelCb = () => {}
) {
  const positionType = typeof position === "string" ? "bbox" : "latlon";
  const positionString =
    typeof position === "string" ? position : `${position.lat},${position.lng}`;

  return new Promise((resolve, reject) => {
    const connection = new Metolib.WfsConnection();
    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      setCancelCb(() => connection.disconnect());

      connection.getData({
        requestParameter: "t2m,ws_10min,ri_10min,snow_aws,vis,n_man,wawa",
        begin: startDate,
        end: endDate,
        timestep: 10 * 60 * 1000,
        [positionType]: positionString,
        callback: function(data, errors) {
          connection.disconnect();

          if (errors.length !== 0) {
            reject(errors);
          } else {
            resolve(data);
          }
        },
      });
    } else {
      reject(["No connection"]);
    }
  });
}
