const appName = process.env.APP_NAME || "cfb"

export default {
  app: {
    name: appName
  },

  server: {
    PORT: process.env.PORT || 8000,
    CLUSTERING: process.env.CLUSTERING || false,
    CLUSTER_MAX_CPUS: process.env.CLUSTER_MAX_CPUS || process.env.WEB_CONCURRENCY || 1,
    IS_PRODUCTION: process.env.IS_PRODUCTION || false,
    HOST: process.env.HOSTNAME || "http://localhost:8080"
  },

  newrelic: {
    key: process.env.NEWRELIC_KEY,
    level: process.env.NEWRELIC_LEVEL || 'info'
  },

  postgres: {
    connection_string: process.env.DATABASE_URL || 'postgres://localhost:5432/cfb'
  },

  logger: {
    options: {
      name: appName,
      level: process.env.LOGGING_LEVEL || "info",
      stream: process.stdout
      /*streams: [
        {
          level: process.env.LOGGING_LEVEL || "info",
          path: path.join(__dirname,"..","logs","wiki.log")
        }
      ]*/
    }
  }
}
