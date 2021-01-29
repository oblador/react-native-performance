import { formatMillisecondsToParts } from './formatMillisecondsToParts';
export function formatMilliseconds(millis) {
  const { value, unit } = formatMillisecondsToParts(millis);
  return `${value}${unit}`;
}
