import get from "lodash/get";
import invoke from "lodash/invoke";
import fromPairs from "lodash/fromPairs";
import createHistory from "history/createBrowserHistory";

/**
 * Make sure that all history operations happen through the specific history object created here:
 */

const history = createHistory();

// Sets or changes an URL value. Use replace by default,
// as we don't need to grow the history stack. We're not
// listening to the url anyway, so going back does nothing.
export const setUrlValue = (key, val, historyAction = "replace") => {
  const query = new URLSearchParams(history.location.search);

  if (val === null || typeof val === "undefined") {
    query.delete(key);
  } else if (query.has(key)) {
    query.set(key, val);
  } else {
    query.append(key, val);
  }

  const queryStr = query.toString();

  invoke(history, historyAction, {
    pathname: history.location.pathname,
    search: queryStr,
  });
};

export const getUrlState = () => {
  const query = new URLSearchParams(history.location.search);
  const urlState = fromPairs(Array.from(query.entries()));
  return urlState;
};

export const getUrlValue = (key, defaultValue = "") => {
  const values = getUrlState();
  const value = get(values, key, defaultValue);

  if (value === "true") return true;
  if (value === "false") return false;

  return value;
};

export const setPathName = (pathName, historyAction = "replace") => {
  invoke(history, historyAction, {
    pathname: pathName,
    search: history.location.search,
  });
};

export const getPathName = () => {
  return history.location.pathname;
};

export const resetUrlState = (replace = false) => {
  if (replace) {
    history.replace({pathname: "", search: ""});
  } else {
    history.push({pathname: "", search: ""});
  }
};
