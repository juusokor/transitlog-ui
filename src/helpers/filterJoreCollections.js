import {isWithinRange, intval} from "./isWithinRange";
import reduce from "lodash/reduce";
import orderBy from "lodash/orderBy";
import groupBy from "lodash/groupBy";
import uniqBy from "lodash/uniqBy";
import get from "lodash/get";
import first from "lodash/first";
import last from "lodash/last";
import flatten from "lodash/flatten";
import diffHours from "date-fns/difference_in_hours";
import {MAX_JORE_YEAR} from "../constants";

export function filterActive(items, date) {
  return items.filter((item) => {
    return isWithinRange(date, item.dateBegin, item.dateEnd);
  });
}

function reduceGroupsToNewestItem(groups) {
  return reduce(
    groups,
    (filtered, items) => {
      filtered.push(
        // Pick the most recent item by sorting it first in the list.
        orderBy(items, ({dateBegin}) => intval(dateBegin), "desc")[0]
      );
      return filtered;
    },
    []
  );
}

// JORE objects have dateBegin and dateEnd props that express a validity range.
// We have a problem where there can be multiple objects with overlapping
// validity ranges
function getValidItemsByDateChains(groups, date) {
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

      // Get the maximum date from amongst the items. The selected chain should
      // end with an item with this date.
      const maxDate = get(first(dateEndOrdered), "dateEnd");

      // This function searches the ordered array to find the next link in the chain.
      // It checks the candidate's dateEnd if it is exactly a day off from item.
      // If it returns false, it did not find a result and item would end the chain.
      function findNextLink(item) {
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

        // Keep track of the iteration so that we can kill the loop if it happens
        // to run off.
        let i = 0;
        const maxIterations = 100;

        // Until the chain ends with the minDate, run the loop. Extra precautions for runaway loops.
        while (get(last(chain), "dateBegin") !== minDate && i < maxIterations) {
          let item;

          if (chain.length === 0) {
            // Use the starting item to start it off. This would be the "last" item in the chain.
            item = startingPoint;

            // If the chain wouldn't end with this link, or if its' dateBegin equals the minDate,
            // add it to the chain.
            if (findNextLink(item) || item.dateBegin === minDate) {
              chain.push(item);

              // If the dateBegin value is a valid minDate, we can end the chain right here.
              if (item.dateBegin === minDate) {
                break;
              }
            }
          }

          // Continue off from the initial item or pick the last added item.
          item = item || last(chain);
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

      // Find the valid endDates and use them to build competing chains.
      // If there is only one of the max endDates among the items
      // it won't be much of a competition.
      const chains = dateEndOrdered
        .filter(({dateEnd}) => dateEnd === maxDate)
        .map(createChain);

      // Declare the winner of the chain competition. Longest chain wins.
      // TODO: We might want to include items from the leftover chains if they don't
      //  overlap with any items in the winning chain. But such cases are very rare.
      const longestChain = orderBy(chains, "length", "desc")[0];
      // Get the item that is active for the selected date from the chain of valid items.
      filtered.push(filterActive(longestChain, date));

      return filtered;
    },
    []
  );

  return flatten(validGroups);
}

export function filterDepartures(departures, date) {
  let departureItems = departures;

  if (date) {
    departureItems = filterActive(departureItems, date);
  }

  const groupedDepartures = groupBy(
    departureItems,
    (departure) =>
      departure.routeId +
      departure.direction +
      departure.hours +
      departure.minutes +
      departure.stopId +
      departure.dayType +
      departure.extraDeparture
  );

  return reduceGroupsToNewestItem(groupedDepartures);
}

export function filterRouteSegments(routeSegments, date = false) {
  let validSegments = uniqBy(routeSegments, "stopId");

  if (date) {
    validSegments = filterActive(validSegments, date);
  }

  // The departures may contain items that are identical and have overlapping
  // in-effect ranges resulting in doubles showing up in the UI lists.
  // They are filtered out here.
  const groupedSegments = groupBy(
    validSegments,
    (segment) =>
      segment.routeId +
      segment.direction +
      segment.stopId +
      segment.nextStopId +
      segment.stopIndex +
      segment.timingStopType
  );

  // Pick the most recent departure item from each group.
  return reduceGroupsToNewestItem(groupedSegments);
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
