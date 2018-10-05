const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBundleVisualizer,
} = require("customize-cra");

module.exports = override(
  addDecoratorsLegacy(),
  disableEsLint(),
  process.env.BUNDLE_VISUALIZE == 1 && addBundleVisualizer()
);
