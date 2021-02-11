import { createPerformance } from '../../src/performance';
import { PerformanceObserverEntryList } from '../../src/performance-observer';
import { checkEntries } from './helpers';

describe('PerformanceObserver', () => {
  test('takeRecords()', done => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver(() => {
      throw new Error('This callback should not have been called.');
    });
    let entries = observer.takeRecords();
    checkEntries(entries, [], 'No records before observe');
    observer.observe({ entryTypes: ['mark'] });
    entries = observer.takeRecords();
    checkEntries(entries, [], 'No records just from observe');
    performance.mark('a');
    performance.mark('b');
    entries = observer.takeRecords();
    checkEntries(entries, [
      { entryType: 'mark', name: 'a' },
      { entryType: 'mark', name: 'b' },
    ]);
    performance.mark('c');
    performance.mark('d');
    performance.mark('e');
    entries = observer.takeRecords();
    checkEntries(entries, [
      { entryType: 'mark', name: 'c' },
      { entryType: 'mark', name: 'd' },
      { entryType: 'mark', name: 'e' },
    ]);
    entries = observer.takeRecords();
    checkEntries(entries, [], 'No entries right after takeRecords');
    observer.disconnect();
    done();
  });
});
