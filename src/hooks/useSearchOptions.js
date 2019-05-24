import {useToggle} from "./useToggle";
import {useMemo, useCallback} from "react";
import debounce from "lodash/debounce";
import get from "lodash/get";

const createDebouncedSearcher = (search) =>
  debounce(async (searchTerm) => {
    await search(searchTerm);
  }, 300);

export const useSearchOptions = (searchFunction) => {
  const [isSearch, toggleIsSearch] = useToggle(false);

  const searcher = useMemo(() => createDebouncedSearcher(searchFunction), [
    searchFunction,
  ]);

  const search = useCallback(
    (value = "") => {
      const searchTerm = get(value, "value", value);

      if (searchTerm && !isSearch) {
        toggleIsSearch(true);
      } else if (!searchTerm && isSearch) {
        toggleIsSearch(false);
      }

      if (isSearch) {
        searcher(searchTerm);
      }
    },
    [searchFunction, isSearch]
  );

  return [search, isSearch];
};
