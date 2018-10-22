const appName = process.env.APP_NAME || "sports"

export default {
  app: {
    name: appName
  },

  server: {
    IS_PRODUCTION:    process.env.NODE_ENV === 'production',
    PORT:             process.env.PORT || 8080,
    WEB_CONCURRENCY:  parseInt(process.env.WEB_CONCURRENCY || 1)
  },

  newrelic: {
    key:    process.env.NEWRELIC_KEY,
    level:  process.env.NEWRELIC_LEVEL || 'info'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  postgres: {
    connection_string: process.env.DATABASE_URL || 'postgres://localhost:5432/sports'
  },

  aws: {
    access_key:     process.env.AWS_ACCESS_KEY_ID,
    access_secret:  process.env.AWS_SECRET_ACCESS_KEY,

    s3: {
      bucket: process.env.AWS_S3_BUCKET || 'whatl3y'
    }
  },

  sports_api: {
    host: process.env.API_HOST || 'https://api.thescore.com/'
  },

  slack: {
    webhookUrl: process.env.SLACK_WEBHOOK_URL
  },

  logger: {
    options: {
      name:   appName,
      level:  process.env.LOGGING_LEVEL || "info",
      stream: process.stdout
    }
  }
}
