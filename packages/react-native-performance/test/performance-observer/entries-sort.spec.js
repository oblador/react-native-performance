import { createPerformance } from '../../src/performance';
import { checkEntries, checkSorted, wait } from './helpers';

describe('PerformanceObserver', () => {
  test('getEntries, getEntriesByType, getEntriesByName sort order', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver((entryList, obs) => {
      const stored_entries = entryList.getEntries();
      const stored_entries_by_type = entryList.getEntriesByType('mark');
      const stored_entries_by_name = entryList.getEntriesByName('name-repeat');
      const startTimeOfMark2 = entryList.getEntriesByName('mark2')[0].startTime;

      checkSorted(stored_entries);
      checkEntries(stored_entries, [
        { entryType: 'measure', name: 'measure1' },
        { entryType: 'measure', name: 'measure2' },
        { entryType: 'measure', name: 'measure3' },
        { entryType: 'measure', name: 'name-repeat' },
        { entryType: 'mark', name: 'mark1' },
        { entryType: 'mark', name: 'mark2' },
        { entryType: 'measure', name: 'measure-matching-mark2-1' },
        { entryType: 'measure', name: 'measure-matching-mark2-2' },
        { entryType: 'mark', name: 'name-repeat' },
        { entryType: 'mark', name: 'name-repeat' },
      ]);

      checkSorted(stored_entries_by_type);
      checkEntries(stored_entries_by_type, [
        { entryType: 'mark', name: 'mark1' },
        { entryType: 'mark', name: 'mark2' },
        { entryType: 'mark', name: 'name-repeat' },
        { entryType: 'mark', name: 'name-repeat' },
      ]);

      checkSorted(stored_entries_by_name);
      checkEntries(stored_entries_by_name, [
        { entryType: 'measure', name: 'name-repeat' },
        { entryType: 'mark', name: 'name-repeat' },
        { entryType: 'mark', name: 'name-repeat' },
      ]);

      observer.disconnect();
      done();
    });

    observer.observe({ entryTypes: ['mark', 'measure'] });

    performance.mark('mark1');
    performance.measure('measure1');
    wait(); // Ensure mark1 !== mark2 startTime by making sure performance.now advances.
    performance.mark('mark2');
    performance.measure('measure2');
    performance.measure('measure-matching-mark2-1', 'mark2');
    wait(); // Ensure mark2 !== mark3 startTime by making sure performance.now advances.
    performance.mark('name-repeat');
    performance.measure('measure3');
    performance.measure('measure-matching-mark2-2', 'mark2');
    wait(); // Ensure name-repeat startTime will differ.
    performance.mark('name-repeat');
    wait(); // Ensure name-repeat startTime will differ.
    performance.measure('name-repeat');
  });
});
