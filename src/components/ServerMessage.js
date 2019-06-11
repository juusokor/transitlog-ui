import React from "react";
import {Query} from "react-apollo";
import gql from "graphql-tag";
import get from "lodash/get";

const messageQuery = gql`
  query uiMessage {
    uiMessage {
      date
      message
    }
  }
`;

const ServerMessage = () => {
  return (
    <Query query={messageQuery}>
      {({data}) => {
        const message = get(data, "uiMessage.message", "");

        console.log(message);

        if (!message) {
          return null;
        }

        return <div style={{color: "white"}}>{message}</div>;
      }}
    </Query>
  );
};

export default ServerMessage;
