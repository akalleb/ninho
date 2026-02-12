const logger = {
  info: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[INFO] ${message}`, ...args);
    }
  },
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
    // Future: Send logs to an external service (e.g. Sentry, Datadog)
  }
};

export default logger;
