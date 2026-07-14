export default () => ({
  port: process.env.PORT ?? 4001,
  database: {
    type: 'mysql',
    autoReconnect: true, // Fix: camelCase
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV === 'local',
    entityPrefix: 'sch_',
    poolSize: 10,
    keepConnectionAlive: true,
    extra: { connectionLimit: 10 },
    replication: {
      restoreNodeTimeout: 3000,
      master: {
        host: process.env.MYSQL_HOST ?? 'localhost',
        port: process.env.MYSQL_PORT ?? 33060,
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE ?? 'scheduler',
      },
      slaves: [
        {
          host: process.env.MYSQL_REPLICA_HOST ?? 'localhost',
          port: process.env.MYSQL_REPLICA_PORT ?? 33061,
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
