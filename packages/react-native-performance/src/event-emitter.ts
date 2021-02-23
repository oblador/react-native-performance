type Callback<T> = (entry: T) => void;

export const createEventEmitter = <T>() => {
  const callbacks = new Set<Callback<T>>();

  const addEventListener = (callback: Callback<T>) => {
    callbacks.add(callback);
  };

  const removeEventListener = (callback: Callback<T>) => {
    callbacks.delete(callback);
  };

  const emit = (event: T) => {
    callbacks.forEach((callback) => {
      callback(event);
    });
  };

  return {
    addEventListener,
    removeEventListener,
    emit,
  };
};
