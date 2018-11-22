import get from "lodash/get";
import invoke from "lodash/invoke";
import fromPairs from "lodash/fromPairs";
import createHistory from "history/createBrowserHistory";

const history = createHistory();

// Sets or changes an URL value. Use repalce by default,
// as we don't need to grow the history stack. We're not
// listening to the url anyway, so going back does nothing.
export const setUrlValue = (key, val, historyAction = "replace") => {
  const query = new URLSearchParams(history.location.search);

  if (!val) {
    query.delete(key);
  } else if (query.has(key)) {
    query.set(key, val);
  } else {
    query.append(key, val);
  }

  const queryStr = query.toString();
  invoke(history, historyAction, {search: queryStr});
};

export const getUrlState = () => {
  const query = new URLSearchParams(history.location.search);
  const urlState = fromPairs(Array.from(query.entries()));
  return urlState;
};

export const getUrlValue = (key) => {
  const values = getUrlState();
  return get(values, key, "");
};
