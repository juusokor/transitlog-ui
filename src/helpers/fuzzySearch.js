function fuzzySearch(needle = "", haystack = "") {
  const search = needle.trim().toLowerCase();
  const hay = haystack.toLowerCase();
  let i = 0;
  let n = -1;
  let l;

  for (; (l = search[i++]); ) if (!~(n = hay.indexOf(l, n + 1))) return false;
  return true;
}

export default fuzzySearch;
