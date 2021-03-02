import { createPerformance } from '../src/performance';

test('Performance.measure with start', () => {
  const mockNow = jest.fn();
  mockNow.mockReturnValue(1);
  const { performance } = createPerformance(mockNow);

  mockNow.mockReturnValue(2);
  performance.mark('start');
  mockNow.mockReturnValue(8);
  const measure1 = performance.measure('measure1', 'start');
  const measure2 = performance.measure('measure2', { start: 'start' });
  expect(measure1.startTime).toBe(2);
  expect(measure2.startTime).toBe(2);
  expect(measure1.duration).toBe(6);
  expect(measure2.duration).toBe(6);
});

test('Performance.measure with end', () => {
  const mockNow = jest.fn();
  mockNow.mockReturnValue(1);
  const { performance } = createPerformance(mockNow);

  mockNow.mockReturnValue(5);
  performance.mark('end');
  mockNow.mockReturnValue(8);
  const measure1 = performance.measure('measure1', null, 'end');
  const measure2 = performance.measure('measure2', {
    end: 'end',
    detail: 'lol',
  });
  expect(measure1.startTime).toBe(1);
  expect(measure2.startTime).toBe(1);
  expect(measure1.duration).toBe(4);
  expect(measure2.duration).toBe(4);
});

test('Performance.measure with duration', () => {
  const mockNow = jest.fn();
  mockNow.mockReturnValue(1);
  const { performance } = createPerformance(mockNow);

  mockNow.mockReturnValue(2);
  performance.mark('start');
  mockNow.mockReturnValue(5);
  performance.mark('end');
  mockNow.mockReturnValue(8);
  const measure1 = performance.measure('measure2', {
    duration: 1,
    end: 'end',
  });
  expect(measure1.startTime).toBe(4);
  expect(measure1.duration).toBe(1);
  const measure2 = performance.measure('measure2', {
    duration: 2,
    start: 'start',
  });
  expect(measure2.startTime).toBe(2);
  expect(measure2.duration).toBe(2);
});
