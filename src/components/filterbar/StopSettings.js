import React from "react";
import Input from "../Input";
import {text, Text} from "../../helpers/text";
import {ControlGroup, Button} from "../Forms";
import {inject, observer} from "mobx-react";
import {app} from "mobx-app";
import AllStopsQuery from "../../queries/AllStopsQuery";
import StopInput from "./StopInput";
import Loading from "../Loading";
import styled from "styled-components";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

@inject(app("Filters"))
@observer
class StopSettings extends React.Component {
  render() {
    const {Filters, state} = this.props;
    const {stop} = state;

    return (
      <>
        <ControlGroup>
          <Input label={text("filterpanel.filter_by_stop")} animatedLabel={false}>
            <AllStopsQuery key="all_stops">
              {({stops, loading}) => {
                if (loading) {
                  return <LoadingSpinner inline={true} />;
                }
                return (
                  <StopInput
                    onSelect={Filters.setStop}
                    stop={stop}
                    stops={stops}
                    loading={loading}
                  />
                );
              }}
            </AllStopsQuery>
          </Input>
        </ControlGroup>
        {!!stop && (
          <Button primary={false} small={true} onClick={() => Filters.setStop("")}>
            <Text>filterpanel.clear.stop</Text>
          </Button>
        )}
      </>
    );
  }
}

export default StopSettings;
