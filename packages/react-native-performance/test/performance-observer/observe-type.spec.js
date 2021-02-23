import { createPerformance } from '../../src/performance';
import { checkEntries, muteConsoleWarn } from './helpers';

describe('PerformanceObserver', () => {
  muteConsoleWarn();

  test("Calling observe() without 'type' or 'entryTypes' throws a TypeError", () => {
    const { performance, PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    expect(() => obs.observe({})).toThrow(TypeError);
    expect(() => obs.observe({ entryType: ['mark', 'measure'] })).toThrow(
      TypeError
    );
  });

  test('Calling observe() with entryTypes and then type should throw an InvalidModificationError', () => {
    const { performance, PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    obs.observe({ entryTypes: ['mark'] });
    expect(() => obs.observe({ type: 'measure' })).toThrow();
  });

  test('Calling observe() with type and then entryTypes should throw an InvalidModificationError', () => {
    const { performance, PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    obs.observe({ type: 'mark' });
    expect(() => obs.observe({ entryTypes: ['measure'] })).toThrow();
  });

  test('Passing in unknown values to type does not throw an exception', () => {
    const { performance, PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // Definitely not an entry type.
    obs.observe({ type: 'this-cannot-match-an-entryType' });
    // Close to an entry type, but not quite.
    obs.observe({ type: 'marks' });
  });

  test('observe() with different type values stacks', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    let observedMark = false;
    let observedMeasure = false;
    const observer = new PerformanceObserver(function (entryList, obs) {
      observedMark |= entryList
        .getEntries()
        .filter((entry) => entry.entryType === 'mark').length;
      observedMeasure |= entryList
        .getEntries()
        .filter((entry) => entry.entryType === 'measure').length;
      // Only conclude the test once we receive both entries!
      if (observedMark && observedMeasure) {
        observer.disconnect();
        done();
      }
    });
    observer.observe({ type: 'mark' });
    observer.observe({ type: 'measure' });
    performance.mark('mark1');
    performance.measure('measure1');
  });
});
