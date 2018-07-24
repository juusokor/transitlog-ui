const rewireReactHotLoader = require("react-app-rewire-hot-loader");

module.exports = function(config, env) {
  // React Hot Loader
  config = rewireReactHotLoader(config, env);

  return config;
};
