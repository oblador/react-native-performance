export const getGridInterval = (maxValue, numberOfIntervals) => {
  const magnitude = Math.pow(10, Math.ceil(Math.log10(maxValue)) - 1);
  const granularity = Math.max(
    1,
    magnitude * 3 > maxValue ? magnitude / 20 : magnitude / 10
  );

  return Math.round(
    Math.ceil(maxValue / (numberOfIntervals - 1) / granularity) * granularity
  );
};

export const getGridIntervals = (maxValue, numberOfIntervals) => {
  const interval = getGridInterval(maxValue, numberOfIntervals);
  return new Array(numberOfIntervals).fill(null).map((_, i) => i * interval);
};
