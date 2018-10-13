const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
  addBabelPlugin,
} = require("customize-cra");

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  addBabelPlugin("react-hot-loader/babel"),
  addBabelPlugin("babel-plugin-styled-components"),
  process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer()
);
