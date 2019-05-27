import {useCallback} from "react";
import get from "lodash/get";
import {search} from "../helpers/search";

export const useSearch = (items, keys, searchOptions = {}) => {
  const searchFn = useCallback(
    (value = "") => {
      const searchTerm = get(value, "value", value);

      if (searchTerm) {
        return search(items, searchTerm, keys, searchOptions);
      }

      return items;
    },
    [keys, items]
  );

  return searchFn;
};
