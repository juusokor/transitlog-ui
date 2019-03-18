import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {ControlGroup} from "../Forms";
import Input from "../Input";
import AllLinesQuery from "../../queries/LinesQuery";
import LineInput from "./LineInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import RouteInput from "./RouteInput";
import {app} from "mobx-app";
import {text} from "../../helpers/text";
import styled from "styled-components";
import Loading from "../Loading";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

@inject(app("Filters"))
@observer
class LineSettings extends Component {
  render() {
    const {
      Filters,
      state: {line, route, date},
    } = this.props;

    return (
      <>
        <ControlGroup>
          <Input label={text("filterpanel.find_line_route")} animatedLabel={false}>
            <AllLinesQuery date={date}>
              {({lines}) => {
                if (!lines) {
                  return <LineInput line={line} onSelect={Filters.setLine} lines={[]} />;
                }

                return <LineInput line={line} onSelect={Filters.setLine} lines={lines} />;
              }}
            </AllLinesQuery>
          </Input>
        </ControlGroup>
        {line && (
          <ControlGroup>
            <RoutesByLineQuery date={date} line={line}>
              {({routes, loading}) => {
                if (!routes && !loading) {
                  return <RouteInput route={route} routes={[]} />;
                }

                if (loading) {
                  return <LoadingSpinner inline={true} />;
                }

                return <RouteInput route={route} routes={routes} />;
              }}
            </RoutesByLineQuery>
          </ControlGroup>
        )}
      </>
    );
  }
}

export default LineSettings;
