const SCHEMA_VERSION = 1;

const getUpdatedSession = (persistedState, getUpdatedSession) => {
  const [session] = persistedState.sessions;
  if (session) {
    const updatedSession = getUpdatedSession(session);
    const sessions = persistedState.sessions.slice();
    sessions.splice(0, 1, updatedSession);
    return Object.assign({}, persistedState, {
      sessions,
    });
  }
  return persistedState;
};

const setDefaultCategoryIfNoneExists = entry => {
  if (!entry.category) {
    return { ...entry, category: 'Other' };
  }
  return entry;
};

export function persistedStateReducer(persistedState, method, payload) {
  console.log(method, payload);
  if (!payload || payload.schemaVersion !== SCHEMA_VERSION) {
    throw new Error(
      `Incompatible schema version, expected ${SCHEMA_VERSION} got ${payload.schemaVersion}. Try upgrading this plugin.`
    );
  }
  if (method === 'setSession') {
    let sessions = persistedState.sessions.slice();
    let existingSession = persistedState.sessions.find(
      session => session.sessionStartedAt === payload.sessionStartedAt
    );
    const session = {
      sessionStartedAt: payload.sessionStartedAt,
      timeOrigin: performance.timeOrigin,
      measures: [],
      marks: [],
      metrics: {},
    };
    if (existingSession) {
      const index = sessions.indexOf(existingSession);
      sessions.splice(index, 1, session);
    } else {
      sessions.unshift(session);
    }

    return Object.assign({}, persistedState, {
      sessions,
    });
  } else if (method === 'appendMeasures') {
    return getUpdatedSession(persistedState, session => ({
      ...session,
      measures: session.measures
        .concat(payload.measures)
        .sort((a, b) => a.startTime - b.startTime)
        .map(setDefaultCategoryIfNoneExists),
    }));
  } else if (method === 'appendMarks') {
    return getUpdatedSession(persistedState, session => ({
      ...session,
      marks: session.marks
        .concat(payload.marks)
        .sort((a, b) => a.startTime - b.startTime),
    }));
  } else if (method === 'setMetrics') {
    return getUpdatedSession(persistedState, session => ({
      ...session,
      metrics: payload.metrics.reduce(
        (acc, item) => {
          acc[item.name] = item;
          return acc;
        },
        { ...session.metrics }
      ),
    }));
  }
  return persistedState;
}
