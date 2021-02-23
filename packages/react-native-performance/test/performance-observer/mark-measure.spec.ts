import { createPerformance } from '../../src/performance';
import { checkEntries } from './helpers';

describe('PerformanceObserver', () => {
  test('entries are observable', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    let stored_entries = [];

    const observer = new PerformanceObserver((entryList) => {
      stored_entries = stored_entries.concat(entryList.getEntries());
      if (stored_entries.length >= 4) {
        checkEntries(stored_entries, [
          { entryType: 'mark', name: 'mark1' },
          { entryType: 'mark', name: 'mark2' },
          { entryType: 'measure', name: 'measure1' },
          { entryType: 'measure', name: 'measure2' },
        ]);
        observer.disconnect();
        done();
      }
    });
    observer.observe({ entryTypes: ['mark', 'measure'] });
    performance.mark('mark1');
    performance.mark('mark2');
    performance.measure('measure1');
    performance.measure('measure2');
  });

  test('mark entries are observable', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    let mark_entries = [];

    const observer = new PerformanceObserver((entryList) => {
      mark_entries = mark_entries.concat(entryList.getEntries());
      if (mark_entries.length >= 2) {
        checkEntries(mark_entries, [
          { entryType: 'mark', name: 'mark1' },
          { entryType: 'mark', name: 'mark2' },
        ]);
        observer.disconnect();
        done();
      }
    });
    observer.observe({ entryTypes: ['mark'] });
    performance.mark('mark1');
    performance.mark('mark2');
  });

  test('measure entries are observable', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    let measure_entries = [];

    const observer = new PerformanceObserver((entryList) => {
      measure_entries = measure_entries.concat(entryList.getEntries());
      if (measure_entries.length >= 2) {
        checkEntries(measure_entries, [
          { entryType: 'measure', name: 'measure1' },
          { entryType: 'measure', name: 'measure2' },
        ]);
        observer.disconnect();
        done();
      }
    });
    observer.observe({ entryTypes: ['measure'] });
    performance.measure('measure1');
    performance.measure('measure2');
  });
});
