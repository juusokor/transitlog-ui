import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";
import PCancelable from "p-cancelable";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "fmi::observations::weather::multipointcoverage";

export function getWeatherForArea(sites, startDate, endDate) {
  if (!sites || sites.length === 0 || !startDate || !endDate) {
    return Promise.reject("All arguments are not valid.");
  }

  return new PCancelable((resolve, reject, onCancel) => {
    const connection = new Metolib.WfsConnection();
    onCancel.shouldReject = false;
    onCancel(() => connection.disconnect());

    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      connection.getData({
        requestParameter: "t2m",
        begin: startDate,
        end: endDate,
        timestep: 10 * 60 * 1000,
        fmisid: sites,
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
