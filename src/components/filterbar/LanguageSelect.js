import React, {Component} from "react";
import {observer, inject} from "mobx-react";
import {app} from "mobx-app";
import get from "lodash/get";
import {LANGUAGES} from "../../stores/UIStore";
import Dropdown from "../Dropdown";

@inject(app("UI"))
@observer
class LanguageSelect extends Component {
  onChange = (e) => {
    const {UI} = this.props;
    const selectedValue = get(e, "target.value", false);

    if (selectedValue) {
      UI.setLanguage(selectedValue);
    }
  };

  render() {
    const {language} = this.props.state;

    return (
      <Dropdown value={language} onChange={this.onChange}>
        <option value={LANGUAGES.FINNISH}>Suomi</option>
        <option value={LANGUAGES.SWEDISH}>Svenska</option>
        <option value={LANGUAGES.ENGLISH}>English</option>
      </Dropdown>
    );
  }
}

export default LanguageSelect;
