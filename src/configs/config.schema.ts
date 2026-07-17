import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('local', 'development', 'production', 'test'),
  PORT: Joi.number().integer().min(1).max(65535),
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().integer().min(1).max(65535).required(),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_ROOT_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string(),
  DB_REPLICA_HOST: Joi.string().hostname().required(),
  DB_REPLICA_PORT: Joi.number().integer().min(1).max(65535).required(),
  DB_REPLICA_USER: Joi.string().required(),
  DB_REPLICA_PASSWORD: Joi.string().required(),
}).required();
