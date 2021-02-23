import { createPerformance } from '../../src/performance';
import { muteConsoleWarn } from './helpers';

describe('PerformanceObserver', () => {
  muteConsoleWarn();

  test("Calling observe() without 'type' or 'entryTypes' throws a TypeError", () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // @ts-ignore
    expect(() => obs.observe({})).toThrow(TypeError);
    // @ts-ignore
    expect(() => obs.observe({ entryType: ['mark', 'measure'] })).toThrow(
      TypeError
    );
  });

  test('Calling observe() with entryTypes and then type should throw an InvalidModificationError', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    obs.observe({ entryTypes: ['mark'] });
    expect(() => obs.observe({ type: 'measure' })).toThrow();
  });

  test('Calling observe() with type and then entryTypes should throw an InvalidModificationError', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    obs.observe({ type: 'mark' });
    expect(() => obs.observe({ entryTypes: ['measure'] })).toThrow();
  });

  test('Passing in unknown values to type does not throw an exception', () => {
    const { PerformanceObserver } = createPerformance();
    const obs = new PerformanceObserver(() => {});
    // Definitely not an entry type.
    // @ts-ignore
    obs.observe({ type: 'this-cannot-match-an-entryType' });
    // Close to an entry type, but not quite.
    // @ts-ignore
    obs.observe({ type: 'marks' });
  });

  test('observe() with different type values stacks', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    let observedMark = 0;
    let observedMeasure = 0;
    const observer = new PerformanceObserver(function (entryList) {
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
