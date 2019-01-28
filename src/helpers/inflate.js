import set from "lodash/set";

// Given an onject with keys like "path.into.nested.object",
// returns a new nested object that mirrors the paths from the keys.

export function inflate(obj) {
  const inflatedObj = {};
  const entries = Object.entries(obj);

  for (const [path, val] of entries) {
    set(inflatedObj, path, val);
  }

  return inflatedObj;
}
