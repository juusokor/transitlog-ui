const rewireReactHotLoader = require("react-app-rewire-hot-loader");
const {injectBabelPlugin} = require("react-app-rewired");

module.exports = function(config, env) {
  config = injectBabelPlugin("transform-class-properties", config);
  config = injectBabelPlugin("transform-decorators-legacy", config);

  // React Hot Loader
  config = rewireReactHotLoader(config, env);

  return config;
};
