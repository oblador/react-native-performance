// Vendored from https://github.com/web-platform-tests/wpt/blob/master/performance-timeline/performanceobservers.js

// Compares a performance entry to a predefined one
// perfEntriesToCheck is an array of performance entries from the user agent
// expectedEntries is an array of performance entries minted by the test
export function checkEntries(perfEntriesToCheck, expectedEntries) {
  function findMatch(pe) {
    // we match based on entryType and name
    for (var i = expectedEntries.length - 1; i >= 0; i--) {
      var ex = expectedEntries[i];
      if (ex.entryType === pe.entryType && ex.name === pe.name) {
        return ex;
      }
    }
    return null;
  }

  expect(perfEntriesToCheck.length).toBe(expectedEntries.length);

  perfEntriesToCheck.forEach(function (pe1) {
    expect(findMatch(pe1)).not.toBe(null);
  });
}

// Waits for performance.now to advance. Since precision reduction might
// cause it to return the same value across multiple calls.
export function wait() {
  const now = global.performance.now();
  while (now === global.performance.now()) continue;
}

// Ensure the entries list is sorted by startTime.
export function checkSorted(entries) {
  expect(entries.length).not.toBe(0);
  if (!entries.length) return;

  var sorted = false;
  var lastStartTime = entries[0].startTime;
  for (var i = 1; i < entries.length; ++i) {
    var currStartTime = entries[i].startTime;
    expect(lastStartTime).toBeLessThanOrEqual(currStartTime);
    lastStartTime = currStartTime;
  }
}

export function muteConsoleWarn() {
  beforeAll(() => {
    const originalWarn = console.warn;
    console.warn = () => {};
    console.warn.original = console.warn;
  });

  afterAll(() => {
    console.warn = console.warn.original;
  });
}
