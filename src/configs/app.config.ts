export default () => ({
  port: +(process.env.PORT ?? 4001),
  nodeEnv: process.env.NODE_ENV ?? 'local',
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
      defaultMode: 'master',
      restoreNodeTimeout: 3000,
      master: {
        host: process.env.DB_HOST,
        port: +(process.env.DB_PORT ?? 3306),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      },
      slaves: [
        {
          host: process.env.DB_REPLICA_HOST,
          port: +(process.env.DB_REPLICA_PORT ?? 3306),
          username: process.env.DB_REPLICA_USER,
          password: process.env.DB_REPLICA_PASSWORD,
          database: process.env.MYSQL_DATABASE,
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
    swaggerOptions: {
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
  },
});
