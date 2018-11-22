import React, {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, reaction} from "mobx";

@observer
class QueryArea extends Component {
  disposeReaction = () => {};

  @observable
  events = [];

  @observable.ref
  currentBounds = null;

  setQueryBounds = action((bounds) => {
    if (!this.currentBounds || !this.currentBounds.equals(bounds)) {
      this.currentBounds = bounds;
    }
  });

  searchEventsInBounds = (bounds) => {
    console.log(bounds);
  };

  componentDidMount() {
    this.disposeReaction = reaction(
      () => this.currentBounds,
      this.searchEventsInBounds
    );
  }

  componentWillUnmount() {
    this.disposeReaction();
  }

  render() {
    const {children} = this.props;
    return children({queryBounds: this.setQueryBounds, events: this.events});
  }
}

export default QueryArea;
