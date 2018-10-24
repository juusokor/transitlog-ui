export default () =>
  new Promise((resolve) => {
    window.requestIdleCallback(resolve);
  });
