import React from "react";
import {observer} from "mobx-react";
import worker from "workerize-loader!../../workers/getHfp.worker";

@observer
class WorkerTest extends React.Component {
  worker = null;

  state = {
    result: 0,
  };

  async componentDidMount() {
    this.worker = worker();

    const loops = await this.worker.expensive(1000);

    this.setState({
      result: loops,
    });
  }

  render() {
    return (
      <div>
        Worker test: <p>{this.state.result}</p>
      </div>
    );
  }
}

export default WorkerTest;
