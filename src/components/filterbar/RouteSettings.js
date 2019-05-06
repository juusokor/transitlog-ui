import React from "react";
import {observer, Observer} from "mobx-react-lite";
import {ControlGroup, ClearButton} from "../Forms";
import Input from "../Input";
import RouteOptionsQuery from "../../queries/RouteOptionsQuery";
import RouteInput, {getFullRoute} from "./RouteInput";
import {text, Text} from "../../helpers/text";
import styled from "styled-components";
import Loading from "../Loading";
import flow from "lodash/flow";
import {inject} from "../../helpers/inject";
import Tooltip from "../Tooltip";
import getTransportType from "../../helpers/getTransportType";
import {SuggestionContent, SuggestionText} from "./SuggestionInput";

const LoadingSpinner = styled(Loading)`
  margin: 0.5rem 0.5rem 0.5rem 1rem;
`;

const RouteDisplay = styled(SuggestionContent).attrs({withIcon: true})`
  font-size: 0.875rem;
  padding-left: 0;
`;

const decorate = flow(
  observer,
  inject("Filters")
);

const RouteSettings = decorate(({Filters, state: {route, date}}) => {
  return (
    <RouteOptionsQuery date={date}>
      {({routes = [], loading, search}) => {
        const selectedRoute = getFullRoute(routes, route);
        console.log(selectedRoute);

        return (
          <Observer>
            {() =>
              loading ? (
                <LoadingSpinner inline={true} />
              ) : (
                <>
                  <ControlGroup>
                    <Input
                      helpText="Select route"
                      label={text("filterpanel.find_line_route")}
                      animatedLabel={false}>
                      <RouteInput search={search} route={route} routes={routes} />
                    </Input>
                    {route && route.routeId && (
                      <Tooltip helpText="Clear route">
                        <ClearButton
                          onClick={() =>
                            Filters.setRoute({
                              routeId: "",
                              direction: "",
                              originStopId: "",
                            })
                          }
                        />
                      </Tooltip>
                    )}
                  </ControlGroup>
                  <RouteDisplay className={getTransportType(selectedRoute.routeId)}>
                    <SuggestionText withIcon={true}>
                      <strong>{selectedRoute.routeId}</strong>{" "}
                      <Text>domain.direction</Text> {selectedRoute.direction},{" "}
                      {selectedRoute.origin} - {selectedRoute.destination}
                    </SuggestionText>
                  </RouteDisplay>
                </>
              )
            }
          </Observer>
        );
      }}
    </RouteOptionsQuery>
  );
});

export default RouteSettings;
