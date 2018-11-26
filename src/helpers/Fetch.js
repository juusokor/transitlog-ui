import {Component} from "react";
import {observer} from "mobx-react";
import {observable, action, toJS} from "mobx";

@observer
class Fetch extends Component {
  prevUrl = "";

  @observable
  result = null;

  @observable
  loading = false;

  @action
  setResult = (result) => {
    this.result = result;
  };

  @action
  setLoading = (setTo = !this.loading) => {
    this.loading = setTo;
  };

  componentDidMount() {
    const {url, options} = this.props;
    this.doRequest(url, options);
  }

  componentDidUpdate() {
    const {url, options} = this.props;
    this.doRequest(url, options);
  }

  doRequest = async (url, options) => {
    if (this.prevUrl !== url) {
      this.prevUrl = url;
      this.setLoading(true);

      const request = await fetch(url, options);
      const result = await request.json();

      this.setResult(result);
      this.setLoading(false);
    }
  };

  render() {
    const {children} = this.props;
    return children({data: toJS(this.result), loading: !!this.loading});
  }
}

export default Fetch;
