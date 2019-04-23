import get from "lodash/get";
import invoke from "lodash/invoke";
import fromPairs from "lodash/fromPairs";
import {createBrowserHistory as createHistory} from "history";

/**
 * Make sure that all history operations happen through the specific history object created here:
 */

let history = createHistory();

// Only for testing
export const __setHistoryForTesting = (historyObj) => {
  history = historyObj;
};

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
  const urlState = fromPairs(
    Array.from(query.entries()).map(([key, value]) => {
      let nextVal = value;
      if (value === "true") {
        nextVal = true;
      }

      if (value === "false") {
        nextVal = false;
      }

      if (value === "" || typeof value === "undefined") {
        nextVal = "";
      }

      return [key, nextVal];
    })
  );
  return urlState;
};

export const getUrlValue = (key, defaultValue = "") => {
  const values = getUrlState();
  return get(values, key, defaultValue);
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
    history.replace({pathname: "/", search: ""});
  } else {
    history.push({pathname: "/", search: ""});
  }
};

export const removeAuthParams = (replace = false) => {
  let shareUrl = window.location.href;
  const url = new URL(shareUrl);
  url.searchParams.delete("code");
  url.searchParams.delete("scope");
  history.replace({pathname: "/", search: url.search});
};
