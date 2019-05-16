import AlertsQuery from "../../queries/AlertsQuery";
import flow from "lodash/flow";
import {observer, Observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import React from "react";
import {getAlertsInEffect, AlertDistribution} from "../../helpers/getAlertsInEffect";
import SidepanelList from "./SidepanelList";
import AlertsList from "../AlertsList";

const decorate = flow(
  observer,
  inject("state")
);

const Alerts = decorate(({state}) => {
  const searchTime = state.date;

  return (
    <AlertsQuery time={searchTime} alertSearch={{all: true}}>
      {({alerts = [], loading}) => (
        <Observer>
          {() => {
            const alertsInEffect = getAlertsInEffect(alerts, state.timeMoment).sort((a) =>
              a.distribution === AlertDistribution.Network ? -1 : 0
            );

            return (
              <SidepanelList loading={loading}>
                {() => <AlertsList alerts={alertsInEffect} />}
              </SidepanelList>
            );
          }}
        </Observer>
      )}
    </AlertsQuery>
  );
});

export default Alerts;
