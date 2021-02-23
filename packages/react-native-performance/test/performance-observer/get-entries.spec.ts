import { createPerformance } from '../../src/performance';
import { checkEntries } from './helpers';

describe('PerformanceObserver', () => {
  test('getEntries, getEntriesByType and getEntriesByName work', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver((entryList) => {
      checkEntries(entryList.getEntries(), [
        { entryType: 'mark', name: 'mark1' },
      ]);

      checkEntries(entryList.getEntriesByType('mark'), [
        { entryType: 'mark', name: 'mark1' },
      ]);
      expect(entryList.getEntriesByType('measure').length).toBe(0);
      // @ts-ignore
      expect(entryList.getEntriesByType('234567').length).toBe(0);

      checkEntries(entryList.getEntriesByName('mark1'), [
        { entryType: 'mark', name: 'mark1' },
      ]);
      expect(entryList.getEntriesByName('mark2').length).toBe(0);
      expect(entryList.getEntriesByName('234567').length).toBe(0);

      checkEntries(entryList.getEntriesByName('mark1', 'mark'), [
        { entryType: 'mark', name: 'mark1' },
      ]);
      expect(entryList.getEntriesByName('mark1', 'measure').length).toBe(0);
      expect(entryList.getEntriesByName('mark2', 'measure').length).toBe(0);
      // @ts-ignore
      expect(entryList.getEntriesByName('mark1', '234567').length).toBe(0);

      observer.disconnect();
      done();
    });
    observer.observe({ entryTypes: ['mark'] });
    performance.mark('mark1');
  });
});
