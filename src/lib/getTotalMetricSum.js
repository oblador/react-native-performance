export const getTotalMetricSum = (session, metrics) =>
  Array.from(metrics.values()).reduce(
    (acc, key) => acc + (session[key] || 0),
    0
  );
