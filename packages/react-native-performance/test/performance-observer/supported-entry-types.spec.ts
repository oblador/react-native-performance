import { createPerformance } from '../../src/performance';

describe('PerformanceObserver.supportedEntryTypes', () => {
  it('exists and returns entries in alphabetical order', () => {
    const { PerformanceObserver } = createPerformance();

    expect(PerformanceObserver.supportedEntryTypes).not.toBeUndefined();
    const types = PerformanceObserver.supportedEntryTypes;
    for (let i = 1; i < types.length; i++) {
      expect(types[i - 1] < types[i]).toBe(true);
    }
  });

  it('caches result', () => {
    const { PerformanceObserver } = createPerformance();

    expect(PerformanceObserver.supportedEntryTypes).toBe(
      PerformanceObserver.supportedEntryTypes
    );
  });
});
