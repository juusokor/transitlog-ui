import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {ControlGroup} from "../Forms";
import Input from "../Input";
import AllLinesQuery from "../../queries/AllLinesQuery";
import LineInput from "./LineInput";
import RoutesByLineQuery from "../../queries/RoutesByLineQuery";
import RouteInput from "./RouteInput";
import {app} from "mobx-app";
import {text} from "../../helpers/text";

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
              {({lines, loading, error}) => {
                if (loading || error) {
                  return null;
                }

                return (
                  <LineInput line={line} onSelect={Filters.setLine} lines={lines} />
                );
              }}
            </AllLinesQuery>
          </Input>
        </ControlGroup>
        {line.lineId &&
          line.dateBegin && (
            <ControlGroup>
              <RoutesByLineQuery
                key={`line_route_${Object.values(line).join("_")}`}
                date={date}
                line={line}>
                {({routes, loading, error}) => {
                  if (loading || error) {
                    return null;
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
