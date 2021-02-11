import { createPerformance } from '../../src/performance';

describe('PerformanceObserver', () => {
  test('PerformanceObserver with buffered flag sees entry after timeout', done => {
    const { performance, PerformanceObserver } = createPerformance();
    performance.mark('foo');
    setTimeout(() => {
      // After a timeout, PerformanceObserver should still receive entry if using the buffered flag.
      new PerformanceObserver(list => {
        const entries = list.getEntries();
        expect(entries.length).toBe(1);
        expect(entries[0].entryType).toBe('mark');
        done();
      }).observe({ type: 'mark', buffered: true });
    }, 100);
  });
});
