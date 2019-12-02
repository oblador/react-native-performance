export const getGridInterval = (maxValue, numberOfIntervals) => {
  const granularity = Math.pow(10, Math.ceil(Math.log10(maxValue)) - 2) || 1;
  const roundedMax = Math.round(
    Math.ceil(maxValue / granularity) * granularity
  );
  return roundedMax / (numberOfIntervals - 1);
};

export const getGridIntervals = (maxValue, numberOfIntervals) => {
  const interval = getGridInterval(maxValue, numberOfIntervals);
  return new Array(numberOfIntervals).fill(null).map((_, i) => i * interval);
};
