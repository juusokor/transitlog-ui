import createHistory from "history/createBrowserHistory";

const history = createHistory();

export const setUrlValue = (key, val) => {
  const query = new URLSearchParams(history.location.search);

  if (!val) {
    query.delete(key);
  } else if (query.has(key)) {
    query.set(key, val);
  } else {
    query.append(key, val);
  }

  const queryStr = query.toString();
  history.push({search: queryStr});
};

export const getInitialUrlState = () => {
  const query = new URLSearchParams(history.location.search);

  const initialState = Array.from(query.entries()).reduce((obj, [key, val]) => {
    obj[key] = val;
    return obj;
  }, {});

  return initialState;
};
