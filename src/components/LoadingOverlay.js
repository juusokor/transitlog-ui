import React from "react";
import "./Loading.css";
import Loading from "./Loading";

export default ({message, show}) => {
  return (
    <div className={`Loading-overlay ${show ? "show-overlay" : ""}`}>
      <Loading />
      <p className="Loading-message">{message}</p>
    </div>
  );
};
