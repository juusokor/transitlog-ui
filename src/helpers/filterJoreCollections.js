import {isWithinRange} from "./isWithinRange";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import get from "lodash/get";
import first from "lodash/first";
import last from "lodash/last";
import map from "lodash/map";
import flatten from "lodash/flatten";
import diffHours from "date-fns/difference_in_hours";
import diffDays from "date-fns/difference_in_days";
import {MAX_JORE_YEAR} from "../constants";

export function filterActive(items, date) {
  if (!date) {
    return items;
  }

  return items.filter((item) => isWithinRange(date, item.dateBegin, item.dateEnd));
}

// JORE objects have dateBegin and dateEnd props that express a validity range.
// We have a problem where there can be multiple objects with overlapping
// validity ranges
export function getValidItemsByDateChains(groups, date, log = false) {
  const validGroups = reduce(
    groups,
    (filtered, items) => {
      // If it's only one item, we're good.
      if (items.length === 1) {
        filtered.push(filterActive(items, date));
        return filtered;
      }

      // Get the minimum dateBegin amongst the items
      const dateBeginOrdered = orderBy(items, "dateBegin", "asc");
      const minDate = get(first(dateBeginOrdered), "dateBegin");

      // Order the items descending from the most distant dateEnd. This
      // is the array we'll pull items from and add to the chain.
      const dateEndOrdered = orderBy(items, "dateEnd", "desc");

      // This function searches the ordered array to find the next link in the chain.
      // It checks the candidate's dateEnd if it is exactly a day off from item.
      // If it returns false, it did not find a result and item would end the chain.
      function findNextLink(item) {
        if (!item) {
          return false;
        }

        for (const candidate of dateEndOrdered) {
          const hoursDiff = diffHours(
            // To get a positive number, put the date we presume to be LATER first.
            get(item, "dateBegin", MAX_JORE_YEAR + "-12-31"),
            // and put the date we presume to be EARLIER second.
            get(candidate, "dateEnd", MAX_JORE_YEAR + "-12-31")
          );

          // If the candidate's dateEnd is roughly one day before our item's dateBegin,
          // it is a valid link for the chain. Need to use hours because of DST.
          if (hoursDiff > 22 && hoursDiff < 26) {
            return candidate;
          }
        }

        // Returning false means that the item we passed into this
        // function is the last in the chain.
        return false;
      }

      // Create a chain and use the item passed in as "startingPoint" to start it off.
      function createChain(startingPoint) {
        const chain = [];

        // Keep track of the iteration so that we can
        // kill the loop if it happens to run off.
        let i = 0;
        const maxIterations = 100;

        // Until the chain ends with the minDate, run the loop.
        // Extra precautions for runaway loops.
        while (get(last(chain), "dateBegin") !== minDate && i < maxIterations) {
          if (chain.length === 0) {
            // Use the starting item to start it off. This would be the "last" item in the chain.

            // If the chain wouldn't end with this link, or if its
            // dateBegin equals the minDate, add it to the chain.
            if (findNextLink(startingPoint) || startingPoint.dateBegin === minDate) {
              chain.push(startingPoint);
              continue;
            }
          }

          // Pick the last added item.
          const item = last(chain);
          const nextItem = findNextLink(item);

          // If there isn't anything to add, I guess we're done...
          if (!nextItem) {
            break;
          }

          // Make sure the item won't end the chain or is a valid end to the chain.
          if (findNextLink(nextItem) || nextItem.dateBegin === minDate) {
            chain.push(nextItem);
          }

          i++;
        }

        // Since we went with the most distant endDate first, the chain is reversed.
        // The rest of the app, as well as the user, expects the items to be in ascending
        // chronological order so the chain just needs to be reversed.
        chain.reverse();
        return chain;
      }

      // Build competing chains
      const chains = dateEndOrdered.map(createChain);

      if (log) {
        console.log(chains);
      }

      if (chains.length === 0) {
        return filtered;
      }

      const lengthOrdered = orderBy(chains, "length", "desc");
      // Declare the winner of the chain competition. Longest chain wins.
      const longestChain = lengthOrdered[0];
      const longestLength = longestChain.length;

      if (longestLength === 0) {
        return filtered;
      }

      const winningChains = lengthOrdered.filter(
        (chain) => chain.length === longestLength
      );

      let winningChain = winningChains[0];

      if (winningChains.length > 1) {
        // Pick the chain with the least amount of days when where are many
        // with the same length.
        winningChain = orderBy(winningChains, (chain) => {
          let days = 0;
          for (const item in chain) {
            days += diffDays(item.dateEnd, item.dateBegin);
          }

          return days;
        })[0]; // The shortest-by-days chain is first
      }

      // Get the item that is active for the selected date from the chain of valid items.
      filtered.push(filterActive(winningChain, date));
      return filtered;
    },
    []
  );

  return flatten(validGroups);
}

export function filterDepartures(departures, date) {
  const groupedDepartures = groupBy(
    departures,
    (departure) =>
      departure.routeId +
      departure.direction +
      departure.hours +
      departure.minutes +
      departure.stopId +
      departure.dayType +
      departure.extraDeparture
  );

  return getValidItemsByDateChains(groupedDepartures, date);
}

export function filterRouteSegments(
  routeSegments,
  date,
  dateBegin = "",
  dateEnd = ""
) {
  // The departures may contain items that are identical and have overlapping
  // in-effect ranges resulting in doubles showing up in the UI lists.
  // They are filtered out here.
  const groupedSegments = groupBy(
    routeSegments,
    (segment) => segment.routeId + segment.direction + segment.stopIndex
  );

  if (dateBegin && dateEnd) {
    const validForRange = map(groupedSegments, (segments) =>
      segments.find((seg) => seg.dateBegin === dateBegin && seg.dateEnd === dateEnd)
    );

    return validForRange.filter((segment) => !!segment);
  } else {
    // Pick the most recent departure item from each group.
    return getValidItemsByDateChains(groupedSegments, date, false);
  }
}

export function filterLines(lines, date) {
  const groupedLines = groupBy(lines, "lineId");
  return getValidItemsByDateChains(groupedLines, date);
}

export function filterRoutes(routes, date) {
  const groupedRoutes = groupBy(
    routes,
    ({routeId, direction}) => `${routeId}.${direction}`
  );

  return getValidItemsByDateChains(groupedRoutes, date);
}
