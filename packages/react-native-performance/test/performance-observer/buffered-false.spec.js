import { createPerformance } from '../../src/performance';

describe('PerformanceObserver', () => {
  test('PerformanceObserver without buffered flag set to false cannot see past entries', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    performance.mark('foo');
    // Use a timeout to ensure the remainder of the test runs after the entry is created.
    setTimeout(() => {
      // Observer with buffered flag set to false should not see entry.
      new PerformanceObserver(() => {
        throw new Error('Should not have observed any entry!');
      }).observe({ type: 'mark', buffered: false });
      // Use a timeout to give time to the observer.
      setTimeout(done, 100);
    }, 0);
  });
});
