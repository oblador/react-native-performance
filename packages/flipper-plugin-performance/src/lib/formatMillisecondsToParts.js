export const formatMillisecondsToParts = millis => {
  const UNITS = [
    ['ms', 1000],
    ['s', 60],
    ['min', Infinity],
  ];

  let unit;
  let value = millis;
  for (let i = 0; i < UNITS.length; i++) {
    unit = UNITS[i][0];
    if (value / UNITS[i][1] >= 2) {
      value /= UNITS[i][1];
    } else {
      break;
    }
  }

  return { value: value.toFixed(value > 1000 ? 0 : 1), unit };
};
