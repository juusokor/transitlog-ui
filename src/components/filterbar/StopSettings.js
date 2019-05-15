import React from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer, Observer} from "mobx-react-lite";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText, SuggestionAlerts} from "./SuggestionInput";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import {getAlertsInEffect} from "../../helpers/getAlertsInEffect";

const decorate = flow(
  observer,
  inject("Filters")
);

const StopSettings = decorate(({Filters, state}) => {
  const {stop, date} = state;

  return (
    <AllStopsQuery>
      {({stops, loading, search}) => (
        <Observer>
          {() => {
            const selectedStop = stops.find((s) => s.id === stop);

            return (
              <>
                <ControlGroup>
                  <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
                    <StopInput
                      date={date}
                      search={search}
                      onSelect={Filters.setStop}
                      stop={stop}
                      stops={stops}
                      loading={loading}
                    />
                  </Input>
                  {!!stop && (
                    <Tooltip helpText="Clear stop">
                      <ClearButton onClick={() => Filters.setStop("")} />
                    </Tooltip>
                  )}
                </ControlGroup>
                {selectedStop && (
                  <SelectedOptionDisplay>
                    <SuggestionText>
                      <strong>{selectedStop.id}</strong> (
                      {selectedStop.shortId.replace(/\s/g, "")})
                      <br />
                      {selectedStop.name}
                    </SuggestionText>
                    <SuggestionAlerts alerts={getAlertsInEffect(selectedStop, date)} />
                  </SelectedOptionDisplay>
                )}
              </>
            );
          }}
        </Observer>
      )}
    </AllStopsQuery>
  );
});

export default StopSettings;
