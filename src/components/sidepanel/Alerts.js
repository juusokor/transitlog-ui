import AlertsQuery from "../../queries/AlertsQuery";
import flow from "lodash/flow";
import {observer, Observer} from "mobx-react-lite";
import {inject} from "../../helpers/inject";
import React from "react";
import {getAlertsInEffect, AlertDistribution} from "../../helpers/getAlertsInEffect";
import SidepanelList from "./SidepanelList";
import AlertsList from "../AlertsList";
import CancellationsQuery from "../../queries/CancellationsQuery";
import CancellationsList from "../CancellationsList";

const decorate = flow(
  observer,
  inject("state")
);

const Alerts = decorate(({state}) => {
  const searchTime = state.date;

  return (
    <AlertsQuery time={searchTime} alertSearch={{all: true}}>
      {({alerts = [], loading: alertsLoading}) => (
        <CancellationsQuery time={searchTime} cancellationsSearch={{all: true}}>
          {({cancellations = [], loading: cancellationsLoading}) => (
            <Observer>
              {() => {
                const alertsInEffect = getAlertsInEffect(alerts, state.timeMoment);

                alertsInEffect.sort((a) =>
                  a.distribution === AlertDistribution.Network ? -1 : 0
                );

                return (
                  <SidepanelList loading={alertsLoading || cancellationsLoading}>
                    {() => (
                      <>
                        {cancellations.length !== 0 && (
                          <CancellationsList
                            showListHeading={true}
                            cancellations={cancellations}
                          />
                        )}
                        {alertsInEffect.length !== 0 && (
                          <AlertsList showListHeading={true} alerts={alertsInEffect} />
                        )}
                      </>
                    )}
                  </SidepanelList>
                );
              }}
            </Observer>
          )}
        </CancellationsQuery>
      )}
    </AlertsQuery>
  );
});

export default Alerts;
