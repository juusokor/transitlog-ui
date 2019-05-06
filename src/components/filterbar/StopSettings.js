import React from "react";
import Input from "../Input";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button, ClearButton} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import Tooltip from "../Tooltip";
import {SelectedOptionDisplay, SuggestionText} from "./SuggestionInput";

@inject(app("Filters"))
@observer
class StopSettings extends React.Component {
  render() {
    const {Filters, state} = this.props;
    const {stop} = state;

    return (
      <AllStopsQuery>
        {({stops, loading, search}) => {
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
                    <strong>{selectedStop.id}</strong> ({selectedStop.shortId})<br />
                    {selectedStop.name}
                  </SuggestionText>
                </SelectedOptionDisplay>
              )}
            </>
          );
        }}
      </AllStopsQuery>
    );
  }
}

export default StopSettings;
