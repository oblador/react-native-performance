import { getGridIntervals } from './getGridIntervals';

describe('getGridIntervals', () => {
  it('returns desired number of intervals', () => {
    expect(getGridIntervals(123, 3)).toHaveLength(3);
    expect(getGridIntervals(123, 10)).toHaveLength(10);
  });

  it('returns nicely rounded intervals', () => {
    expect(getGridIntervals(123, 3)).toEqual([0, 65, 130]);
    expect(getGridIntervals(2123, 5)).toEqual([0, 550, 1100, 1650, 2200]);
    expect(getGridIntervals(8020, 5)).toEqual([0, 2100, 4200, 6300, 8400]);
    expect(getGridIntervals(809, 5)).toEqual([0, 210, 420, 630, 840]);
  });
});
