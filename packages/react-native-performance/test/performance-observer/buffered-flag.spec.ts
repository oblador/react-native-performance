import { createPerformance } from '../../src/performance';

describe('PerformanceObserver', () => {
  test('PerformanceObserver with buffered flag should see past and future entries', (done) => {
    const { performance, PerformanceObserver } = createPerformance();
    for (let i = 0; i < 50; i++) performance.mark('foo' + i);
    let marksCreated = 50;
    let marksReceived = 0;
    new PerformanceObserver((list) => {
      marksReceived += list.getEntries().length;
      if (marksCreated < 100) {
        performance.mark('bar' + marksCreated);
        marksCreated++;
      }
      if (marksReceived == 100) done();
    }).observe({ type: 'mark', buffered: true });
  });
});
