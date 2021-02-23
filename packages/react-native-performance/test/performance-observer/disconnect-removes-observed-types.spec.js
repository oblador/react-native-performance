import { createPerformance } from '../../src/performance';
import { checkEntries } from './helpers';

describe('PerformanceObserver', () => {
  test('Types observed are forgotten when disconnect() is called', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver((entryList) => {
      // There should be no mark entry.
      checkEntries(entryList.getEntries(), [
        { entryType: 'measure', name: 'b' },
      ]);
      done();
    });
    observer.observe({ type: 'mark' });
    // Disconnect the observer.
    observer.disconnect();
    // Now, only observe measure.
    observer.observe({ type: 'measure' });
    performance.mark('a');
    performance.measure('b');
  });
});
