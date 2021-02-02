import { PerformanceEntry } from "./performance-entry";

type Callback = (entry: PerformanceEntry) => void;

export const createEventEmitter = () => {
  const callbacks = new Set<Callback>();

  const addEventListener = (callback: Callback) => {
    callbacks.add(callback);
  };

  const removeEventListener = (callback: Callback) => {
    callbacks.delete(callback);
  };

  const emit = (event: PerformanceEntry) => {
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
