export default ({ env }) => ({
  connection: {
    client: 'mysql',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 3306),
      database: env('DATABASE_NAME', 'neom'),
      user: env('DATABASE_USERNAME', 'root'),
      password: env('DATABASE_PASSWORD', 'root123'),
      ssl: env.bool('DATABASE_SSL', false),
    },
    pool: {
      min: env.int('DATABASE_POOL_MIN', 0),
      max: env.int('DATABASE_POOL_MAX', 10),
      acquireTimeoutMillis: env.int('DATABASE_POOL_ACQUIRE', 60000),
      createTimeoutMillis: env.int('DATABASE_POOL_CREATE', 30000),
      destroyTimeoutMillis: env.int('DATABASE_POOL_DESTROY', 5000),
      idleTimeoutMillis: env.int('DATABASE_POOL_IDLE', 30000),
      reapIntervalMillis: env.int('DATABASE_POOL_REAP', 1000),
      createRetryIntervalMillis: env.int('DATABASE_POOL_RETRY', 200),
    },
  },
});


