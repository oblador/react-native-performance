import { createPerformance } from '../src/performance';

describe('as a polyfill', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('performance.now() does not cause infinite recursion', () => {
    const { performance } = createPerformance();
    // In react-native we can just polyfill the whole global object with `global.performance = performance`
    // Doing the same in Node has no effect. The test would pass even without any change to `performance.ts`
    jest
      // @ts-ignore
      .spyOn(global.performance, 'now')
      .mockImplementation(performance.now.bind(performance));

    // @ts-ignore
    expect(() => global.performance.now()).not.toThrow();
  });
});
