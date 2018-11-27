import {action, computed, observable, toJS, extendObservable} from "mobx";
import * as mobxUtils from "mobx-utils";

export function createDebouncedObservable(observableValue) {
  class DebounceObservableValue {
    @observable
    value = observableValue;
    _lastUpdate = 0;
    _lastValue = null;

    @action
    setValue(value) {
      this.value = value;
    }

    @computed
    get debouncedValue() {
      const now = mobxUtils.now(500);
      const delta = now - this._lastUpdate;
      const timeRange = this.value;

      if (delta > 1000) {
        this._lastValue = timeRange;
        this._lastUpdate = now;
      }

      return this._lastValue;
    }
  }

  return new DebounceObservableValue();
}
