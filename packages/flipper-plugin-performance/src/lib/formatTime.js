const TIME_FORMAT_SHORT = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

export const formatTime = (date) => TIME_FORMAT_SHORT.format(date);
