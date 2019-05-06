import React from "react";
import {observer} from "mobx-react-lite";
import {ControlGroup, Button} from "../Forms";
import Input from "../Input";
import RouteOptionsQuery from "../../queries/RouteOptionsQuery";
import RouteInput from "./RouteInput";
import {text, Text} from "../../helpers/text";
import styled from "styled-components";
import Loading from "../Loading";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Tooltip from "../Tooltip";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const decorate = flow(
  observer,
  inject("Filters")
);

const LineSettings = decorate(({Filters, state: {route, date}}) => {
  return (
    <>
      <ControlGroup>
        <Input label={text("filterpanel.find_line_route")} animatedLabel={false}>
          <RouteOptionsQuery date={date}>
            {({routes, loading}) => {
              if (!routes && !loading) {
                return <RouteInput route={route} routes={[]} />;
              }

              if (loading) {
                return <LoadingSpinner inline={true} />;
              }

              return <RouteInput route={route} routes={routes} />;
            }}
          </RouteOptionsQuery>
        </Input>
      </ControlGroup>
      {route && route.routeId && (
        <Tooltip helpText="Clear route">
          <Button
            primary={false}
            small={true}
            onClick={() =>
              Filters.setRoute({
                routeId: "",
                direction: "",
                originStopId: "",
              })
            }>
            <Text>filterpanel.clear.route</Text>
          </Button>
        </Tooltip>
      )}
    </>
  );
});

export default LineSettings;
