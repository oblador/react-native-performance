import { createPerformance } from '../../src/performance';
import { checkEntries } from './helpers';

describe('PerformanceObserver', () => {
  test("Two calls of observe() with the same 'type' cause override", done => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver(entryList => {
      checkEntries(entryList.getEntries(), [
        { entryType: 'mark', name: 'early' },
      ]);
      observer.disconnect();
      done();
    });
    performance.mark('early');
    // This call will not trigger anything.
    observer.observe({ type: 'mark' });
    // This call should override the previous call and detect the early mark.
    observer.observe({ type: 'mark', buffered: true });
  });
});
