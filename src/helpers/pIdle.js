export default async () =>
  new Promise((resolve) => {
    window.requestIdleCallback(resolve);
  });
