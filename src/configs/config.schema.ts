import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string().valid('local', 'development', 'production', 'test'),
  PORT: Joi.number().integer().min(1).max(65535),
  MYSQL_HOST: Joi.string().hostname(),
  MYSQL_PORT: Joi.number().integer().min(1).max(65535),
  MYSQL_USER: Joi.string().required(),
  MYSQL_PASSWORD: Joi.string().required(),
  MYSQL_ROOT_PASSWORD: Joi.string().required(),
  MYSQL_DATABASE: Joi.string(),
  MYSQL_REPLICA_HOST: Joi.string().hostname(),
  MYSQL_REPLICA_PORT: Joi.number().integer().min(1).max(65535),
  MYSQL_REPLICA_USER: Joi.string(),
  MYSQL_REPLICA_PASSWORD: Joi.string(),
}).required();
