import React from "react";
import "./Loading.css";
import Spinner from "react-spinkit";

export default () => {
  return (
    <div className="Loading">
      <Spinner name="circle" color="white" fadeIn="none" />
    </div>
  );
};
