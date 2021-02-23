import { createPerformance } from '../../src/performance';
import { PerformanceObserverEntryList } from '../../src/performance-observer';
import { checkEntries, muteConsoleWarn } from './helpers';

describe('PerformanceObserver', () => {
  muteConsoleWarn();

  test('entryTypes must be a sequence or throw a TypeError', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // @ts-ignore
    expect(() => obs.observe({ entryTypes: 'mark' })).toThrow(TypeError);
  });

  test('Unknown entryTypes do not throw an exception', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // @ts-ignore
    obs.observe({ entryTypes: ['this-cannot-match-an-entryType'] });
    // @ts-ignore
    obs.observe({ entryTypes: ['marks', 'navigate', 'resources'] });
  });

  test('Filter unsupported entryType entryType names within the entryTypes sequence', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // @ts-ignore
    obs.observe({ entryTypes: ['mark', 'this-cannot-match-an-entryType'] });
    // @ts-ignore
    obs.observe({ entryTypes: ['this-cannot-match-an-entryType', 'mark'] });
    // @ts-ignore
    obs.observe({ entryTypes: ['mark'], others: true });
  });

  test('Check observer callback parameter and this values', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver(function (entryList, obs) {
      expect(entryList).toBeInstanceOf(PerformanceObserverEntryList);
      expect(obs).toBeInstanceOf(PerformanceObserver);
      expect(observer).toBe(this);
      expect(observer).toBe(obs);
      expect(this).toBe(obs);
      observer.disconnect();
      done();
    });
    performance.clearMarks();
    observer.observe({ entryTypes: ['mark'] });
    performance.mark('mark1');
  });

  test('replace observer if already present', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    const observer = new PerformanceObserver(function (entryList) {
      checkEntries(entryList.getEntries(), [
        { entryType: 'measure', name: 'measure1' },
      ]);
      observer.disconnect();
      done();
    });
    performance.clearMarks();
    observer.observe({ entryTypes: ['mark'] });
    observer.observe({ entryTypes: ['measure'] });
    performance.mark('mark1');
    performance.measure('measure1');
  });
});
