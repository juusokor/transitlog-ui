import React from "react";
import "./Loading.css";
import Loading from "./Loading";

export default ({message}) => {
  return (
    <div className="Loading-overlay">
      <Loading />
      <p className="Loading-message">{message}</p>
    </div>
  );
};
