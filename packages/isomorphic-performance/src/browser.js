const g = typeof globalThis === 'undefined' ? window : globalThis;

module.exports = {
  PerformanceObserver: g.PerformanceObserver,
  performance: g.performance,
};
