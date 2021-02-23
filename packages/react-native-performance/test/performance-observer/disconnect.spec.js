import { createPerformance } from '../../src/performance';

describe('PerformanceObserver', () => {
  test('disconnected callbacks must not be invoked', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver((entryList, obs) => {
      throw new Error('This callback must not be invoked');
    });
    observer.observe({ entryTypes: ['mark', 'measure'] });
    observer.disconnect();
    performance.mark('mark1');
    performance.measure('measure1');
    setTimeout(done, 2000);
  });

  test('disconnecting an unconnected observer is a no-op', () => {
    const { performance, PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => true);
    obs.disconnect();
    obs.disconnect();
  });

  test('An observer disconnected after a mark must not have its callback invoked', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver((entryList, obs) => {
      throw new Error('This callback must not be invoked');
    });
    observer.observe({ entryTypes: ['mark'] });
    performance.mark('mark1');
    observer.disconnect();
    performance.mark('mark2');
    setTimeout(done, 2000);
  });
});
