import React from "react";
import Input from "../Input";
import {text} from "../../helpers/text";
import {ControlGroup, ClearButton} from "../Forms";
import {observer, Observer} from "mobx-react-lite";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";

const decorate = flow(
  observer,
  inject("Filters")
);

const StopSettings = decorate(({Filters, state}) => {
  const {stop} = state;

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
                      <strong>{selectedStop.id}</strong> ({selectedStop.shortId})
                      <br />
                      {selectedStop.name}
                    </SuggestionText>
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
