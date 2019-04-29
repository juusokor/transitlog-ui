import Metolib from "@fmidev/metolib";
import {FMI_APIKEY} from "../constants";
import PCancelable from "p-cancelable";

const SERVER_URL = `https://data.fmi.fi/fmi-apikey/${FMI_APIKEY}/wfs`;
const STORED_QUERY_OBSERVATION = "livi::observations::road::finland::multipointcoverage";

export function getRoadConditionsForArea(bbox, startDate, endDate) {
  return new PCancelable((resolve, reject, onCancel) => {
    const connection = new Metolib.WfsConnection();
    if (connection.connect(SERVER_URL, STORED_QUERY_OBSERVATION)) {
      onCancel.shouldReject = false;
      onCancel(() => connection.disconnect());

      connection.getData({
        requestParameter: "rscal,rscst,rscif,rsil",
        begin: startDate,
        end: endDate,
        timestep: 60 * 60 * 1000,
        bbox,
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
