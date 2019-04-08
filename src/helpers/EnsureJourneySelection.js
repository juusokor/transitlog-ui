import {useEffect} from "react";
import {observer} from "mobx-react-lite";
import get from "lodash/get";
import flow from "lodash/flow";
import {inject} from "./inject";

/*
  A helper component to deselect a selected journey that does not exist
  if one such journey has somehow become selected.
 */

const decorate = flow(
  observer,
  inject("Journey", "Filters")
);

const EnsureJourneySelection = decorate(
  ({Filters, Journey, children, journey, loading}) => {
    useEffect(() => {
      if (!loading) {
        if (!journey || journey.events.length === 0) {
          Journey.setSelectedJourney(null);
        } else if (journey) {
          const vehicleId = get(journey, "uniqueVehicleId", "");
          Filters.setVehicle(vehicleId);
          Journey.setJourneyVehicle(vehicleId);
        }
      }
    }, [journey, loading]);

    return children({journey, loading});
  }
);

export default EnsureJourneySelection;
