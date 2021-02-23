import { createPerformance } from '../src/performance';

test('PerformanceEntry.toJSON()', () => {
  const { performance } = createPerformance();

  performance.mark('markName');
  performance.measure('measureName');

  const entries = performance.getEntries();
  const performanceEntryKeys = ['name', 'entryType', 'startTime', 'duration'];
  for (let i = 0; i < entries.length; ++i) {
    expect(typeof entries[i].toJSON).toBe('function');
    const json = entries[i].toJSON();
    expect(typeof json).toBe('object');
    for (const key of performanceEntryKeys) {
      expect(json[key]).toBe(entries[i][key]);
    }
  }
});
