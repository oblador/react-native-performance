const perf = require('perf_hooks').performance;
global.performance.now = perf.now.bind(perf);
