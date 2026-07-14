export default () => ({
  port: +(process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? 'local',
  logLevel: process.env.LOG_LEVEL ?? 'debug',
  database: {
    type: 'mysql',
    autoReconnect: true,
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    entityPrefix: 'sch_',
    poolSize: 10,
    keepConnectionAlive: true,
    extra: { connectionLimit: 10 },
    timezone: 'Z',
    replication: {
      restoreNodeTimeout: 3000,
      master: {
        host: process.env.MYSQL_HOST ?? 'localhost',
        port: +(process.env.MYSQL_PORT ?? 13306),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE ?? 'scheduler',
      },
      slaves: [
        {
          host: process.env.MYSQL_REPLICA_HOST ?? 'localhost',
          port: +(process.env.MYSQL_REPLICA_PORT ?? 13307),
          username: process.env.MYSQL_REPLICA_USER,
          password: process.env.MYSQL_REPLICA_PASSWORD,
          database: process.env.MYSQL_DATABASE ?? 'scheduler',
        },
      ],
    },
  },
  swagger: {
    enabled: process.env.NODE_ENV !== 'production',
    title: 'Appointment Scheduler',
    description: 'Appointment Scheduler Service API documentation',
    version: '1.0',
    path: 'api-docs',
  },
});
