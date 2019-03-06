import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

export async function getWeatherForArea(bbox, dateTime) {
  const startTime = dateTime.toDate();
  const endTime = dateTime.add(1, "hour").toDate();

  return new Promise((resolve, reject) => {
    const connection = new Metolib.WfsConnection();
    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      connection.getData({
        requestParameter: "t",
        begin: startTime,
        end: endTime,
        timestep: 60 * 60 * 1000,
        bbox: bbox,
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
