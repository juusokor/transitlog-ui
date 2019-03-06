import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "livi::observations::road::multipointcoverage";

export async function getRoadConditionsForArea(
  bbox,
  dateTime,
  setCancelCb = () => {}
) {
  const endTime = dateTime.toDate();
  const startTime = dateTime.subtract(6, "hours").toDate();

  return new Promise((resolve, reject) => {
    const connection = new Metolib.WfsConnection();
    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      setCancelCb(() => connection.disconnect());

      connection.getData({
        requestParameter: "rscal,rscst,rscif,rsil",
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
