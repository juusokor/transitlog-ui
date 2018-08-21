import {collection as collectionFactory} from "mobx-app";

const collection = (items, primaryKey, itemFactory) => {
  const collected = collectionFactory(items, itemFactory);

  function getItem(identifier) {
    return collected.getItem(identifier, primaryKey);
  }

  function getIndex(item) {
    return collected.getIndex(item, primaryKey);
  }

  function addItems(items, processAll) {
    return collected.addItems(items, primaryKey, processAll);
  }

  function addItem(item, replace, first) {
    return collected.addItem(item, primaryKey, replace, first);
  }

  function updateItem(item) {
    return collected.updateItem(item, primaryKey);
  }

  function updateOrAdd(item, first) {
    return collected.updateOrAdd(item, primaryKey, first);
  }

  function removeItem(itemOrIndex) {
    return collected.removeItem(itemOrIndex, primaryKey);
  }

  return {
    ...collected,
    getIndex,
    getItem,
    addItems,
    addItem,
    updateItem,
    updateOrAdd,
    removeItem,
  };
};

export default collection;
