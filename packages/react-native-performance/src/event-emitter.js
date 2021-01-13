export const createEventEmitter = () => {
  const callbacks = new Set();

  const addEventListener = callback => {
    callbacks.add(callback);
  };

  const removeEventListener = callback => {
    callbacks.delete(callback);
  };

  const emit = event => {
    callbacks.forEach(callback => {
      callback(event);
    });
  };

  return {
    addEventListener,
    removeEventListener,
    emit,
  };
};
