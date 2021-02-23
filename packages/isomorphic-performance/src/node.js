const { performance } = require('perf_hooks');
const {
  createPerformance,
} = require('react-native-performance/lib/commonjs/performance');

module.exports = createPerformance(performance.now);
